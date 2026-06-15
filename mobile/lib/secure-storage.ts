import * as SecureStore from "expo-secure-store";

// Wrapper quanh expo-secure-store (lưu mã hóa ở Keychain/Keystore) để thay cho
// AsyncStorage với token nhạy cảm. API mô phỏng AsyncStorage cho dễ thay thế.
export const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),

  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),

  removeItem: (key: string) => SecureStore.deleteItemAsync(key),

  multiRemove: (keys: string[]) =>
    Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key))),
};
