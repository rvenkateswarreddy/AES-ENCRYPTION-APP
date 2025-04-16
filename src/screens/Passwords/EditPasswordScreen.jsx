import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AuthContext} from '../../App';
import firestore from '@react-native-firebase/firestore';
import CryptoJS from 'crypto-js';
import 'react-native-get-random-values';
import {useTheme} from '../../contexts/ThemeContext';

const EditPasswordScreen = ({route, navigation}) => {
  const {password} = route.params;
  const [website, setWebsite] = useState(password.website);
  const [username, setUsername] = useState(password.username);
  const [passwordValue, setPasswordValue] = useState(password.password);
  const [notes, setNotes] = useState(password.notes);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const {colors} = useTheme();
  const {user} = useContext(AuthContext);

  const generatePassword = () => {
    setIsGenerating(true);
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordValue(result);
    setIsGenerating(false);
  };

  const handleUpdate = async () => {
    if (!website || !passwordValue) {
      Alert.alert('Error', 'Website and password are required');
      return;
    }

    try {
      setLoading(true);

      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const derivedKey = userDoc.data()?.encryption?.derivedKey;

      if (!derivedKey) {
        Alert.alert('Error', 'No encryption key found');
        return;
      }

      const passwordData = {
        website,
        username,
        password: passwordValue,
        notes,
        createdAt: password.createdAt,
      };

      const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(passwordData),
        derivedKey,
      ).toString();

      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('passwords')
        .doc(password.id)
        .update({
          plaintextData: passwordData,
          encryptedData,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert('Success', 'Password updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update password');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={[styles.title, {color: colors.text}]}>Edit Password</Text>

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

        <View style={styles.passwordInputContainer}>
          <TextInput
            style={[
              styles.passwordInput,
              {color: colors.text, borderColor: colors.border},
            ]}
            placeholder="Password"
            placeholderTextColor={colors.placeholder}
            value={passwordValue}
            onChangeText={setPasswordValue}
            secureTextEntry
          />
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generatePassword}
            disabled={isGenerating}>
            <Icon
              name={isGenerating ? 'loading' : 'dice-multiple'}
              size={24}
              color={isGenerating ? colors.disabled : colors.primary}
            />
          </TouchableOpacity>
        </View>

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
          onPress={handleUpdate}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formContainer: {
    borderRadius: 8,
    padding: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  generateButton: {
    marginLeft: 8,
    padding: 8,
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
});

export default EditPasswordScreen;
