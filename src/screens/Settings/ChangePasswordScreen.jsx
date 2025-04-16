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
import {useTheme} from '../../contexts/ThemeContext';
import {AuthContext} from '../../App';
import auth from '@react-native-firebase/auth';

const ChangePasswordScreen = ({navigation}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {colors} = useTheme();
  const {user} = useContext(AuthContext);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);

      // Reauthenticate user
      const credential = auth.EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await auth().currentUser.reauthenticateWithCredential(credential);

      // Update password
      await auth().currentUser.updatePassword(newPassword);

      Alert.alert('Success', 'Password changed successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={[styles.title, {color: colors.text}]}>Change Password</Text>

      <View style={[styles.inputContainer, {backgroundColor: colors.card}]}>
        <Icon
          name="lock"
          size={20}
          color={colors.secondaryText}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, {color: colors.text}]}
          placeholder="Current Password"
          placeholderTextColor={colors.placeholder}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />
      </View>

      <View style={[styles.inputContainer, {backgroundColor: colors.card}]}>
        <Icon
          name="lock-plus"
          size={20}
          color={colors.secondaryText}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, {color: colors.text}]}
          placeholder="New Password"
          placeholderTextColor={colors.placeholder}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
      </View>

      <View style={[styles.inputContainer, {backgroundColor: colors.card}]}>
        <Icon
          name="lock-check"
          size={20}
          color={colors.secondaryText}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, {color: colors.text}]}
          placeholder="Confirm New Password"
          placeholderTextColor={colors.placeholder}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[styles.button, {backgroundColor: colors.primary}]}
        onPress={handleChangePassword}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Change Password</Text>
        )}
      </TouchableOpacity>
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
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen;
