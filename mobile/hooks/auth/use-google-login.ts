import { configureGoogleSignin } from '@/lib/google-signin';
import axios from '@/setup/axios';
import { User } from '@/types/users.type';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
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

/** Lỗi khi người dùng tự huỷ hộp thoại Google — component nên bỏ qua, không báo lỗi. */
export class GoogleSignInCancelledError extends Error {
  constructor() {
    super('Người dùng đã huỷ đăng nhập Google');
    this.name = 'GoogleSignInCancelledError';
  }
}

export const isGoogleCancelled = (error: unknown) =>
  error instanceof GoogleSignInCancelledError;

export const useGoogleLogin = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      configureGoogleSignin();

      // Android: đảm bảo Google Play Services có sẵn & đủ mới
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      let idToken: string | null | undefined;
      try {
        const response = await GoogleSignin.signIn();
        if (response.type !== 'success') {
          // Người dùng đóng hộp thoại
          throw new GoogleSignInCancelledError();
        }
        idToken = response.data.idToken;
      } catch (err) {
        if (
          isErrorWithCode(err) &&
          err.code === statusCodes.SIGN_IN_CANCELLED
        ) {
          throw new GoogleSignInCancelledError();
        }
        throw err;
      }

      if (!idToken) {
        throw new Error('Không lấy được Google idToken. Vui lòng thử lại.');
      }

      const res = await axios.post<ApiResponse<AuthResponse>>('/auth/google', {
        idToken,
      });

      const authData = res.data.data;

      if (!authData.user || !getAuthToken(authData)) {
        throw new Error(
          'Phản hồi đăng nhập Google không có thông tin xác thực.',
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
