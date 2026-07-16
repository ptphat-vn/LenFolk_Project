import axios from '@/setup/axios';
import { User } from '@/types/users.type';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';

type AuthResponse = {
  message?: string;
  user?: User;
  token?: string;
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

const getAuthToken = (data: AuthResponse) =>
  data.token ?? data.accessToken ?? data.access_token;

const getRefreshToken = (data: AuthResponse) =>
  data.refreshToken ?? data.refresh_token;

/** Lỗi khi người dùng tự huỷ hộp thoại Apple — component nên bỏ qua, không báo lỗi. */
export class AppleSignInCancelledError extends Error {
  constructor() {
    super('Người dùng đã huỷ đăng nhập Apple');
    this.name = 'AppleSignInCancelledError';
  }
}

export const isAppleCancelled = (error: unknown) =>
  error instanceof AppleSignInCancelledError;

export const useAppleLogin = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      let credential: AppleAuthentication.AppleAuthenticationCredential;
      try {
        credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
      } catch (err) {
        if ((err as { code?: string })?.code === 'ERR_REQUEST_CANCELED') {
          throw new AppleSignInCancelledError();
        }
        throw err;
      }

      const identityToken = credential.identityToken;

      if (!identityToken) {
        throw new Error('Không lấy được Apple identityToken. Vui lòng thử lại.');
      }

      // Apple chỉ gửi tên ở lần đăng nhập đầu tiên — gửi kèm để server đặt tên tài khoản
      const fullName =
        [credential.fullName?.givenName, credential.fullName?.familyName]
          .filter(Boolean)
          .join(' ') || undefined;

      const res = await axios.post<ApiResponse<AuthResponse>>('/auth/apple', {
        identityToken,
        fullName,
      });

      const authData = res.data.data;

      if (!authData.user || !getAuthToken(authData)) {
        throw new Error(
          'Phản hồi đăng nhập Apple không có thông tin xác thực.',
        );
      }

      return authData;
    },
    onSuccess: async (data) => {
      const token = getAuthToken(data);
      const refreshToken = getRefreshToken(data);

      if (data.user && token) {
        await setAuth(data.user, token, refreshToken);
      }
    },
  });
};
