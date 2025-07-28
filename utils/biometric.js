import * as LocalAuthentication from 'expo-local-authentication';

export async function isBiometricSupportedAndEnrolled() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
}

export async function authenticateBiometric() {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock Doc Vault',
    cancelLabel: 'Cancel',
    disableDeviceFallback: false, // allow PIN fallback
  });
  return result.success;
}
