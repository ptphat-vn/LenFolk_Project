import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (!user?.subscriptionPlan) {
      throw new ForbiddenException(
        'Premium subscription required to access this content',
      );
    }
    return true;
  }
}
