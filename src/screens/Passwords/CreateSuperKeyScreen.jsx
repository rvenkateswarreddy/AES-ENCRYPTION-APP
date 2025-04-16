import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useAuth} from '../../contexts/AuthContext';

const CreateSuperKeyScreen = ({navigation}) => {
  const [superKey, setSuperKey] = useState('');
  const [confirmSuperKey, setConfirmSuperKey] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [superKeyExists, setSuperKeyExists] = useState(false);

  const {colors} = useTheme();
  const {user} = useAuth();

  useEffect(() => {
    // Check if a super key exists when the component mounts
    const checkSuperKeyExists = async () => {
      setLoading(true);
      try {
        const userDoc = await firestore()
          .collection('users')
          .doc(user.uid)
          .get();
        if (userDoc.exists && userDoc.data()?.encryption?.derivedKey) {
          setSuperKeyExists(true);
        } else {
          setSuperKeyExists(false);
        }
      } catch (error) {
        console.error('Error checking super key:', error);
        Alert.alert('Error', 'Failed to check super key. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkSuperKeyExists();
  }, [user.uid]);

  const handleCreateSuperKey = async () => {
    if (!superKey || !confirmSuperKey) {
      Alert.alert('Error', 'Please enter and confirm your super key');
      return;
    }

    if (superKey !== confirmSuperKey) {
      Alert.alert('Error', 'Super keys do not match');
      return;
    }

    if (superKey.length < 8) {
      Alert.alert('Error', 'Super key must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      const derivedKey = superKey; // You can enhance this to hash the key for more security
      await firestore().collection('users').doc(user.uid).set(
        {
          encryption: {
            derivedKey,
          },
        },
        {merge: true},
      );

      Alert.alert('Success', 'Super key created successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating super key:', error);
      Alert.alert('Error', 'Failed to create super key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSuperKey = async () => {
    if (!accountPassword) {
      Alert.alert('Error', 'Please enter your account password to proceed');
      return;
    }

    try {
      setLoading(true);

      // Re-authenticate the user
      const credential = auth.EmailAuthProvider.credential(
        user.email,
        accountPassword,
      );
      await auth().currentUser.reauthenticateWithCredential(credential);

      // Fetch and display the existing super key
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const derivedKey = userDoc.data()?.encryption?.derivedKey;

      if (derivedKey) {
        Alert.alert('Super Key', `Your super key is: ${derivedKey}`);
      } else {
        Alert.alert('Error', 'No super key found');
      }
    } catch (error) {
      console.error('Error viewing super key:', error);
      Alert.alert(
        'Error',
        'Failed to authenticate. Please check your password.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSuperKey = async () => {
    if (!accountPassword) {
      Alert.alert('Error', 'Please enter your account password to proceed');
      return;
    }

    try {
      setLoading(true);

      // Re-authenticate the user
      const credential = auth.EmailAuthProvider.credential(
        user.email,
        accountPassword,
      );
      await auth().currentUser.reauthenticateWithCredential(credential);

      // Delete the super key and associated passwords
      await firestore().collection('users').doc(user.uid).update({
        encryption: firestore.FieldValue.delete(),
      });

      const passwordsCollection = firestore()
        .collection('users')
        .doc(user.uid)
        .collection('passwords');
      const snapshots = await passwordsCollection.get();

      const batch = firestore().batch();
      snapshots.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      Alert.alert('Success', 'Super key and all associated passwords deleted');
      setSuperKeyExists(false);
    } catch (error) {
      console.error('Error deleting super key:', error);
      Alert.alert('Error', 'Failed to delete super key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {superKeyExists ? (
        <>
          <Text style={[styles.title, {color: colors.text}]}>
            Super Key Already Exists
          </Text>
          <Text style={[styles.subtitle, {color: colors.secondaryText}]}>
            To view or delete the super key, please enter your account password.
          </Text>

          <TextInput
            style={[
              styles.input,
              {color: colors.text, borderColor: colors.border},
            ]}
            placeholder="Account Password"
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            value={accountPassword}
            onChangeText={setAccountPassword}
          />

          <TouchableOpacity
            style={[styles.button, {backgroundColor: colors.primary}]}
            onPress={handleViewSuperKey}>
            <Text style={styles.buttonText}>View Super Key</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, {backgroundColor: colors.error}]}
            onPress={handleDeleteSuperKey}>
            <Text style={styles.buttonText}>Delete Super Key</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={[styles.title, {color: colors.text}]}>
            Create Super Key
          </Text>
          <Text style={[styles.subtitle, {color: colors.secondaryText}]}>
            This key will be used to secure your passwords. Make sure to
            remember it!
          </Text>

          <TextInput
            style={[
              styles.input,
              {color: colors.text, borderColor: colors.border},
            ]}
            placeholder="Super Key"
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            value={superKey}
            onChangeText={setSuperKey}
          />

          <TextInput
            style={[
              styles.input,
              {color: colors.text, borderColor: colors.border},
            ]}
            placeholder="Confirm Super Key"
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            value={confirmSuperKey}
            onChangeText={setConfirmSuperKey}
          />

          <TouchableOpacity
            style={[styles.button, {backgroundColor: colors.primary}]}
            onPress={handleCreateSuperKey}>
            <Text style={styles.buttonText}>Create Super Key</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateSuperKeyScreen;
