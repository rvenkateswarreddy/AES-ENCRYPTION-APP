import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import CryptoJS from 'crypto-js';
import 'react-native-get-random-values';
import {useTheme} from '../../contexts/ThemeContext';
import {useAuth} from '../../contexts/AuthContext';

const ChatScreen = ({route}) => {
  const {userId, userName} = route.params;
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const {colors} = useTheme();
  const {user} = useAuth();
  const flatListRef = useRef();

  useEffect(() => {
    const chatId = [user.uid, userId].sort().join('_');

    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .onSnapshot(async snapshot => {
        const userDoc = await firestore()
          .collection('users')
          .doc(user.uid)
          .get();
        const derivedKey = userDoc.data()?.encryption?.derivedKey;

        if (!derivedKey) {
          setLoading(false);
          return;
        }

        const loadedMessages = [];

        snapshot.forEach(doc => {
          const data = doc.data();
          try {
            const decrypted = CryptoJS.AES.decrypt(
              data.encryptedContent,
              derivedKey,
            ).toString(CryptoJS.enc.Utf8);
            if (decrypted) {
              loadedMessages.push({
                id: doc.id,
                ...data,
                content: decrypted,
              });
            }
          } catch (error) {
            console.error('Decryption error:', error);
          }
        });

        setMessages(loadedMessages);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [userId, user]);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);

      const chatId = [user.uid, userId].sort().join('_');
      const receiverDoc = await firestore()
        .collection('users')
        .doc(userId)
        .get();
      const receiverKey = receiverDoc.data()?.encryption?.derivedKey;

      if (!receiverKey) {
        Alert.alert('Error', 'Cannot send encrypted message to this user');
        return;
      }

      const encryptedContent = CryptoJS.AES.encrypt(
        message,
        receiverKey,
      ).toString();

      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add({
          senderId: user.uid,
          encryptedContent,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });

      setMessage('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({item}) => {
    const isMe = item.senderId === user.uid;

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.theirMessage,
          {backgroundColor: isMe ? colors.primary : colors.card},
        ]}>
        <Text
          style={[styles.messageText, {color: isMe ? '#fff' : colors.text}]}>
          {item.content}
        </Text>
        <Text
          style={[
            styles.timeText,
            {color: isMe ? 'rgba(255,255,255,0.7)' : colors.secondaryText},
          ]}>
          {item.timestamp
            ?.toDate()
            .toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, {backgroundColor: colors.background}]}
      keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <Text style={[styles.headerText, {color: colors.text}]}>
          {userName}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        inverted
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToOffset({offset: 0})
        }
      />

      <View style={[styles.inputContainer, {backgroundColor: colors.card}]}>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
            },
          ]}
          placeholder="Type a message..."
          placeholderTextColor={colors.placeholder}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, {backgroundColor: colors.primary}]}
          onPress={handleSend}
          disabled={sending || !message.trim()}>
          <Icon name={sending ? 'loading' : 'send'} size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;
