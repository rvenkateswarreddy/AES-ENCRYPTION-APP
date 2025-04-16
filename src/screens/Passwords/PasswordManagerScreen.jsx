import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../../contexts/ThemeContext';
import {useAuth} from '../../contexts/AuthContext';
import {useSuperKey} from '../../contexts/SuperKeyContext';
import firestore from '@react-native-firebase/firestore';
import CryptoJS from 'crypto-js';

const PasswordManagerScreen = ({navigation}) => {
  const [website, setWebsite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [derivedKey, setDerivedKey] = useState(null); // Store the derived key
  const {colors} = useTheme();
  const {user} = useAuth();
  const {isAuthenticated, setIsAuthenticated} = useSuperKey();

  useEffect(() => {
    // Listen for changes in the user's document to detect super key deletion
    const unsubscribeUserDoc = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(async docSnapshot => {
        if (docSnapshot.exists && docSnapshot.data()?.encryption?.derivedKey) {
          setDerivedKey(docSnapshot.data().encryption.derivedKey);
        } else {
          // Super key has been deleted; clear passwords
          setDerivedKey(null);
          setPasswords([]);
        }
      });

    return () => unsubscribeUserDoc();
  }, [user.uid]);

  useEffect(() => {
    if (!derivedKey) {
      setLoading(false);
      return;
    }

    // Listen for changes in the passwords collection
    const unsubscribePasswords = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('passwords')
      .orderBy('createdAt', 'desc')
      .onSnapshot(async snapshot => {
        const decryptedPasswords = [];

        for (const doc of snapshot.docs) {
          const data = doc.data();
          try {
            const decryptedBytes = CryptoJS.AES.decrypt(
              data.encryptedData,
              derivedKey,
            );
            const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

            if (decryptedText) {
              decryptedPasswords.push({
                id: doc.id,
                ...JSON.parse(decryptedText),
              });
            }
          } catch (error) {
            console.error('Decryption error:', error);
          }
        }

        setPasswords(decryptedPasswords);
        setLoading(false);
      });

    return () => unsubscribePasswords();
  }, [derivedKey]);

  const handleSavePassword = async () => {
    if (!website || !password) {
      Alert.alert('Error', 'Website and password are required');
      return;
    }

    try {
      setIsSaving(true);

      if (!derivedKey) {
        Alert.alert('Error', 'Super key is missing. Please recreate it.');
        return;
      }

      const passwordData = {
        website,
        username,
        password,
        notes,
        createdAt: new Date().toISOString(),
      };

      const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(passwordData),
        derivedKey,
      ).toString();

      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('passwords')
        .add({
          encryptedData,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      setWebsite('');
      setUsername('');
      setPassword('');
      setNotes('');

      Alert.alert('Success', 'Password saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save password');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePassword = async id => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this password?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore()
                .collection('users')
                .doc(user.uid)
                .collection('passwords')
                .doc(id)
                .delete();

              Alert.alert('Success', 'Password deleted successfully');
            } catch (error) {
              console.error('Error deleting password:', error);
              Alert.alert(
                'Error',
                'Failed to delete password. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  const handleViewPassword = item => {
    navigation.navigate('PasswordDetail', {password2: item});
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
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={[styles.title, {color: colors.text}]}>Password Manager</Text>

      <View style={[styles.formContainer, {backgroundColor: colors.card}]}>
        <TextInput
          style={[
            styles.input,
            {color: colors.text, borderColor: colors.border},
          ]}
          placeholder="Website"
          placeholderTextColor={colors.placeholder}
          value={website}
          onChangeText={setWebsite}
        />

        <TextInput
          style={[
            styles.input,
            {color: colors.text, borderColor: colors.border},
          ]}
          placeholder="Username"
          placeholderTextColor={colors.placeholder}
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={[
            styles.input,
            {color: colors.text, borderColor: colors.border},
          ]}
          placeholder="Password"
          placeholderTextColor={colors.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={[
            styles.input,
            {color: colors.text, borderColor: colors.border},
          ]}
          placeholder="Notes (optional)"
          placeholderTextColor={colors.placeholder}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <TouchableOpacity
          style={[styles.saveButton, {backgroundColor: colors.primary}]}
          onPress={handleSavePassword}
          disabled={isSaving || !derivedKey}>
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Password</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={passwords}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View
            style={[
              styles.passwordItem,
              {backgroundColor: colors.card, flexDirection: 'row'},
            ]}>
            <TouchableOpacity
              style={{flex: 1}}
              onPress={() => handleViewPassword(item)}>
              <View style={styles.passwordInfo}>
                <Text style={[styles.passwordWebsite, {color: colors.text}]}>
                  {item.website}
                </Text>
                <Text
                  style={[
                    styles.passwordUsername,
                    {color: colors.secondaryText},
                  ]}>
                  {item.username || 'No username'}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{alignSelf: 'center'}}
              onPress={() => handleDeletePassword(item.id)}>
              <Icon name="delete" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="shield-lock" size={48} color={colors.secondaryText} />
            <Text style={[styles.emptyText, {color: colors.secondaryText}]}>
              No passwords saved yet
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formContainer: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  saveButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 16,
  },
  passwordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  passwordInfo: {
    flex: 1,
    marginLeft: 16,
  },
  passwordWebsite: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordUsername: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default PasswordManagerScreen;
