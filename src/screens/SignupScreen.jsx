import React, {useState} from 'react';
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
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';

const SignupScreen = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const {colors} = useTheme();
  const {register} = useAuth();

  const validateInputs = () => {
    const errors = {};
    if (!name) errors.name = 'Name is required';
    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (!confirmPassword)
      errors.confirmPassword = 'Confirm Password is required';
    if (password && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (password && password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    return errors;
  };

  const handleSignup = async () => {
    const validationErrors = validateInputs();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({}); // Clear errors before attempting signup
      const success = await register(email, password);
      if (success) {
        Alert.alert('Success', 'Account created successfully');
      }
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={[styles.title, {color: colors.text}]}>Create Account</Text>

      <View style={[styles.inputContainer, {backgroundColor: colors.card}]}>
        <Icon
          name="account"
          size={20}
          color={colors.secondaryText}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, {color: colors.text}]}
          placeholder="Full Name"
          placeholderTextColor={colors.placeholder}
          value={name}
          onChangeText={text => {
            setName(text);
            setErrors(prev => ({...prev, name: undefined}));
          }}
        />
      </View>
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <View style={[styles.inputContainer, {backgroundColor: colors.card}]}>
        <Icon
          name="email"
          size={20}
          color={colors.secondaryText}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, {color: colors.text}]}
          placeholder="Email"
          placeholderTextColor={colors.placeholder}
          value={email}
          onChangeText={text => {
            setEmail(text);
            setErrors(prev => ({...prev, email: undefined}));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <View style={[styles.inputContainer, {backgroundColor: colors.card}]}>
        <Icon
          name="lock"
          size={20}
          color={colors.secondaryText}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, {color: colors.text}]}
          placeholder="Password"
          placeholderTextColor={colors.placeholder}
          value={password}
          onChangeText={text => {
            setPassword(text);
            setErrors(prev => ({...prev, password: undefined}));
          }}
          secureTextEntry
        />
      </View>
      {errors.password && (
        <Text style={styles.errorText}>{errors.password}</Text>
      )}

      <View style={[styles.inputContainer, {backgroundColor: colors.card}]}>
        <Icon
          name="lock-check"
          size={20}
          color={colors.secondaryText}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, {color: colors.text}]}
          placeholder="Confirm Password"
          placeholderTextColor={colors.placeholder}
          value={confirmPassword}
          onChangeText={text => {
            setConfirmPassword(text);
            setErrors(prev => ({...prev, confirmPassword: undefined}));
          }}
          secureTextEntry
        />
      </View>
      {errors.confirmPassword && (
        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
      )}

      <TouchableOpacity
        style={[styles.signupButton, {backgroundColor: colors.primary}]}
        onPress={handleSignup}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.signupButtonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.loginText, {color: colors.primary}]}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
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
  signupButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
});

export default SignupScreen;
