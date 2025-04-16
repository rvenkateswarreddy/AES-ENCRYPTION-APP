import firestore from '@react-native-firebase/firestore';
import EncryptService from '../encryption/EncryptionService';
import auth from '@react-native-firebase/auth';

class ChatService {
  constructor() {
    this.userId = auth().currentUser?.uid;
  }

  // Get public key of another user
  async getPublicKey(userId) {
    try {
      const doc = await firestore().collection('users').doc(userId).get();

      if (!doc.exists) {
        throw new Error('User not found');
      }

      return doc.data().publicKey;
    } catch (error) {
      console.error('Error getting public key:', error);
      throw new Error('Failed to get user public key');
    }
  }

  // Send encrypted message
  async sendMessage(receiverId, message) {
    try {
      const publicKey = await this.getPublicKey(receiverId);
      const encryptedMessage = await EncryptService.encryptData(
        message,
        publicKey,
      );

      await firestore()
        .collection('chats')
        .doc(`${this.userId}_${receiverId}`)
        .collection('messages')
        .add({
          senderId: this.userId,
          content: encryptedMessage,
          timestamp: firestore.FieldValue.serverTimestamp(),
          status: 'sent',
        });

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  // Get chat messages
  async getMessages(otherUserId) {
    try {
      const chatId = [this.userId, otherUserId].sort().join('_');
      const snapshot = await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

      const masterKey = await EncryptService.retrieveKey();
      const messages = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        try {
          const decryptedContent = await EncryptService.decryptData(
            data.content,
            masterKey,
          );
          messages.push({
            id: doc.id,
            ...data,
            content: decryptedContent,
          });
        } catch (decryptError) {
          console.error('Failed to decrypt message:', decryptError);
          messages.push({
            id: doc.id,
            ...data,
            content: '[Encrypted message]',
          });
        }
      }

      return messages;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw new Error('Failed to load messages');
    }
  }
}

export default new ChatService();
