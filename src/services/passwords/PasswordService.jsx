import firestore from '@react-native-firebase/firestore';
import CryptoJS from 'crypto-js';

const PasswordService = {
  async getPasswordDetails(id, userId) {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      console.log(userDoc, 'userdoc');
      const derivedKey = userDoc.data()?.encryption?.derivedKey;

      if (!derivedKey) {
        throw new Error('Encryption key not found');
      }

      const doc = await firestore()
        .collection('users')
        .doc(userId)
        .collection('passwords')
        .doc(id)
        .get();

      if (!doc.exists) {
        return null;
      }

      const encryptedData = doc.data().encryptedData;
      console.log(encryptedData, 'encrypdata');
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, derivedKey);
      const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedText) {
        throw new Error('Failed to decrypt password data');
      }

      return JSON.parse(decryptedText);
    } catch (error) {
      console.error('Error fetching password details:', error);
      throw error;
    }
  },

  async deletePassword(id, userId) {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('passwords')
        .doc(id)
        .delete();
    } catch (error) {
      console.error('Error deleting password:', error);
      throw error;
    }
  },

  async savePassword(passwordData, userId) {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      const derivedKey = userDoc.data()?.encryption?.derivedKey;

      if (!derivedKey) {
        throw new Error('Encryption key not found');
      }

      const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(passwordData),
        derivedKey,
      ).toString();

      await firestore()
        .collection('users')
        .doc(userId)
        .collection('passwords')
        .add({
          encryptedData,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error saving password:', error);
      throw error;
    }
  },
};

export default PasswordService;
