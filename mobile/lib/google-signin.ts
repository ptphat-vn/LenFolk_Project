import { GoogleSignin } from '@react-native-google-signin/google-signin';

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

let configured = false;

export const configureGoogleSignin = () => {
  if (configured) return;
  GoogleSignin.configure({
    webClientId,
    iosClientId,
    offlineAccess: false,
  });
  configured = true;
};

export const isGoogleSigninConfigured = () => Boolean(webClientId);
