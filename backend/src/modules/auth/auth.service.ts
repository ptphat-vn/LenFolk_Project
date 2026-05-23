import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { UserService } from '../user/user.service';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { comparePassword, hashPassword } from '../../common/utils/hash.util';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client | null = null;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  private getGoogleClient(): OAuth2Client {
    if (this.googleClient) return this.googleClient;

    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new BadRequestException('Google client ID not configured');
    }

    this.googleClient = new OAuth2Client(clientId);
    return this.googleClient;
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.userService.findByEmail(registerDto.email);
    if (existing) throw new ConflictException('Email already in use');

    const user = await this.userService.create(registerDto);
    const tokens = await this.generateTokens(
      user._id.toString(),
      user.role,
    );

    return { user, ...tokens };
  }

  async login(loginDto: LoginDto, req: Request) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await comparePassword(
      loginDto.password,
      user.passwordHash,
    );
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive)
      throw new UnauthorizedException('Account is deactivated');

    const tokens = await this.generateTokens(
      user._id.toString(),
      user.role,
      req,
    );

    const { passwordHash: _, ...userWithoutPassword } = user.toObject
      ? user.toObject()
      : user;

    return { user: userWithoutPassword, ...tokens };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenModel.findOneAndUpdate(
      { token: refreshToken },
      { isRevoked: true },
    );
  }

  async refreshTokens(token: string, req: Request) {
    const storedToken = await this.refreshTokenModel.findOne({
      token,
      isRevoked: false,
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.refreshTokenModel.findByIdAndUpdate(storedToken._id, {
      isRevoked: true,
    });

    const user = await this.userService.findById(storedToken.userId);
    return this.generateTokens(
      user._id.toString(),
      user.role,
      req,
    );
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user)
      return { message: 'If the email exists, a reset link has been sent' };

    // TODO: Generate reset token, queue email via BullMQ
    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    // TODO: Verify token, update password
    const newHash = await hashPassword(dto.newPassword);
    void newHash;
    throw new BadRequestException('Reset token is invalid or expired');
  }

  async googleLogin(dto: GoogleLoginDto, req: Request) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new BadRequestException('Google client ID not configured');
    }

    const ticket = await this.getGoogleClient().verifyIdToken({
      idToken: dto.idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;

    if (!email) {
      throw new UnauthorizedException('Google token missing email');
    }

    let user = await this.userService.findByEmail(email);

    if (!user) {
      const displayName =
        payload?.name || email.split('@')[0] || 'Google User';

      user = await this.userService.createSocialUser({
        email,
        fullName: displayName,
        avatar: payload?.picture || null,
        googleId: payload?.sub || null,
      });
    } else {
      if (!user.isActive)
        throw new UnauthorizedException('Account is deactivated');

      const needsLink = !user.googleId && payload?.sub;
      if (needsLink) {
        await this.userService.linkGoogleAccount(
          user._id,
          payload?.sub,
          payload?.picture || null,
        );
        user = await this.userService.findByEmail(email);
        if (!user) throw new UnauthorizedException('Account not found after link');
      }
    }

    const tokens = await this.generateTokens(
      user._id.toString(),
      user.role,
      req,
    );

    const { passwordHash: _, ...userWithoutPassword } = user.toObject
      ? user.toObject()
      : user;

    return { user: userWithoutPassword, ...tokens };
  }

  async googleCallback(req: Request) {
    // TODO: Handle Google OAuth2 callback via Passport
    return { message: 'Google OAuth2 callback handler' };
  }

  private async generateTokens(userId: string, role: string, req?: Request) {
    const payload = { sub: userId, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.accessSecret'),
      expiresIn: this.configService.get('jwt.accessExpiresIn'),
    });

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);

    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      },
    );

    await this.refreshTokenModel.create({
      userId,
      token: refreshToken,
      expiresAt: refreshExpiry,
      userAgent: req?.headers['user-agent'] as string | undefined,
      ipAddress: req?.ip as string | undefined,
    });

    return { accessToken, refreshToken };
  }
}
