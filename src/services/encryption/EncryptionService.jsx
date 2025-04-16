import CryptoJS from 'crypto-js';
import * as Keychain from 'react-native-keychain';
import 'react-native-get-random-values';

class EncryptionService {
  constructor() {
    this.ITERATIONS = 100000;
    this.KEY_SIZE = 256;
    this.SALT_SIZE = 128;
  }

  // Generate secure random salt
  generateSalt() {
    return CryptoJS.lib.WordArray.random(this.SALT_SIZE / 8).toString();
  }

  // Derive key from password
  async deriveKey(password, salt) {
    try {
      return CryptoJS.PBKDF2(password, salt, {
        keySize: this.KEY_SIZE / 32,
        iterations: this.ITERATIONS,
        hasher: CryptoJS.algo.SHA512,
      }).toString();
    } catch (error) {
      console.error('Key derivation failed:', error);
      throw new Error('Failed to derive encryption key');
    }
  }

  // Encrypt data with AES-256-CBC
  async encryptData(text, key) {
    try {
      // Generate a random IV
      const iv = CryptoJS.lib.WordArray.random(128 / 8).toString(
        CryptoJS.enc.Hex,
      );

      // Parse the key as Base64
      const keyBase64 = CryptoJS.enc.Base64.parse(key);

      // Encrypt the text
      const encrypted = CryptoJS.AES.encrypt(text, keyBase64, {
        iv: CryptoJS.enc.Hex.parse(iv),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      });

      // Return structured encrypted data
      return JSON.stringify({
        cipher: encrypted.toString(),
        iv: iv,
      });
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }
  async decryptData(encryptedData, key) {
    try {
      console.log('Encrypted data received for decryption:', encryptedData);

      // Parse the key as Base64
      const keyBase64 = CryptoJS.enc.Base64.parse(key);
      console.log('Parsed Key (Base64):', keyBase64);

      let cipherText, iv;

      // Check if the encrypted data is structured JSON or a raw string
      if (encryptedData.startsWith('{')) {
        // Parse JSON structure (new format)
        const parsedData = JSON.parse(encryptedData);
        cipherText = parsedData.cipher;
        iv = CryptoJS.enc.Hex.parse(parsedData.iv); // Parse IV as Hex
      } else {
        // Assume raw string (legacy format)
        cipherText = encryptedData;
        iv = null; // No IV for legacy data
      }

      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(cipherText, keyBase64, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      });

      const result = decrypted.toString(CryptoJS.enc.Utf8);

      if (!result) {
        throw new Error(
          'Decryption failed - possibly wrong key or corrupted data',
        );
      }

      console.log('Decrypted result:', result);
      return result;
    } catch (error) {
      console.error('Decryption failed:', error.message);
      throw new Error('Failed to decrypt data: ' + error.message);
    }
  }
  // Key management
  async storeKey(key, service = 'com.securevault.masterkey') {
    try {
      await Keychain.setGenericPassword(service, key, {
        service,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        storage:
          Platform.OS === 'android' ? Keychain.STORAGE_TYPE.RSA : undefined,
      });
    } catch (error) {
      console.error('Key storage failed:', error);
      throw new Error('Failed to securely store encryption key');
    }
  }

  async retrieveKey(service = 'com.securevault.masterkey') {
    try {
      const credentials = await Keychain.getGenericPassword({service});
      if (!credentials) {
        throw new Error('No encryption key found');
      }
      return credentials.password;
    } catch (error) {
      console.error('Key retrieval failed:', error);
      throw new Error('Failed to retrieve encryption key');
    }
  }

  async clearKey(service = 'com.securevault.masterkey') {
    try {
      await Keychain.resetGenericPassword({service});
    } catch (error) {
      console.error('Key removal failed:', error);
      throw new Error('Failed to remove encryption key');
    }
  }
}

export default new EncryptionService();
