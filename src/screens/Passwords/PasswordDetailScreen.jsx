import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import {ThemeContext} from '@react-navigation/native';
import {useSuperKey} from '../../contexts/SuperKeyContext';
import {useAuth} from '../../contexts/AuthContext';
import CryptoJS from 'crypto-js';
import firestore from '@react-native-firebase/firestore';
const PasswordDetailScreen = ({route, navigation}) => {
  const {password2} = route.params;
  const id = password2?.id;
  const [password, setPassword] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [superKeyInput, setSuperKeyInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(true); // Always start with the modal shown
  const {colors} = useContext(ThemeContext);
  const {superKey, setIsAuthenticated, setSuperKey} = useSuperKey();
  const {user} = useAuth();
  console.log(superKey, 'superKey');
  console.log(superKeyInput, 'superKeyInput');
  // Function to decrypt and fetch password details
  const getPasswordDetails = async (id, userId) => {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();

      // Retrieve the derived key for encryption
      const derivedKey = userDoc.data()?.encryption?.derivedKey;
      setSuperKey(derivedKey);
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

      // Decrypt the encrypted password data
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
  };

  // Function to load the password details
  const loadPassword = async () => {
    try {
      setLoading(true);
      const data = await getPasswordDetails(id, user.uid);

      if (!data) {
        Alert.alert('Error', 'Password not found');
        navigation.goBack();
        return;
      }

      setPassword(data);
      setShowAuthModal(false); // Close the modal after successful authentication
    } catch (error) {
      console.error('Error loading password:', error);
      Alert.alert('Error', 'Failed to load password details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchPassword = async () => {
      try {
        const data = await getPasswordDetails(id, user.uid);
        setPassword(data);
      } catch (error) {
        console.error('Error fetching password:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPassword();
  }, [id, user.uid]);
  // Function to validate the entered super key
  const verifySuperKey = () => {
    if (superKeyInput === superKey) {
      setIsAuthenticated(true);
      loadPassword(); // Call loadPassword after successful validation
    } else {
      setAuthError('Invalid super key');
    }
  };

  // Handle copying text (username or password) to clipboard
  const handleCopy = (text, label) => {
    try {
      Clipboard.setString(text);
      Alert.alert('Copied', `${label} copied to clipboard`);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
      console.error('Copy failed:', error);
    }
  };

  // Render loading indicator while fetching data
  if (loading) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      {/* Super Key Authentication Modal */}
      {showAuthModal && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View
            style={[
              styles.modalContainer,
              {backgroundColor: 'rgba(0,0,0,0.5)'},
            ]}>
            <View style={[styles.authModal, {backgroundColor: colors.card}]}>
              <Text style={[styles.authTitle, {color: colors.text}]}>
                Enter Super Key
              </Text>
              <Text
                style={[styles.authSubtitle, {color: colors.secondaryText}]}>
                Your super key is required to view this password
              </Text>

              <TextInput
                style={[
                  styles.authInput,
                  {color: colors.text, borderColor: colors.border},
                ]}
                placeholder="Super Key"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                value={superKeyInput}
                onChangeText={setSuperKeyInput}
                autoFocus
              />

              {authError ? (
                <Text style={[styles.authError, {color: colors.error}]}>
                  {authError}
                </Text>
              ) : null}

              <View style={styles.authButtonContainer}>
                <TouchableOpacity
                  style={[styles.authButton, {backgroundColor: colors.border}]}
                  onPress={() => navigation.goBack()}>
                  <Text style={[styles.authButtonText, {color: colors.text}]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.authButton, {backgroundColor: colors.primary}]}
                  onPress={verifySuperKey}>
                  <Text style={[styles.authButtonText, {color: 'white'}]}>
                    Verify
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Password Details Section */}
      {password && (
        <ScrollView
          style={[styles.container, {backgroundColor: colors.background}]}
          contentContainerStyle={styles.content}>
          <View style={[styles.card, {backgroundColor: colors.card}]}>
            <View style={styles.header}>
              <Icon
                name={password.website ? 'web' : 'application'}
                size={32}
                color={colors.primary}
              />
              <Text style={[styles.title, {color: colors.text}]}>
                {password.website || 'No website'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, {color: colors.secondaryText}]}>
                Login Details
              </Text>

              <DetailRow
                label="Username"
                value={password.username || 'No username'}
                icon="account"
                onPress={() => handleCopy(password.username, 'Username')}
                colors={colors}
              />

              <DetailRow
                label="Password"
                value={showPassword ? password.password : '••••••••'}
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => handleCopy(password.password, 'Password')}
                onIconPress={() => setShowPassword(!showPassword)}
                colors={colors}
              />
            </View>

            {password.notes && (
              <View style={styles.section}>
                <Text
                  style={[styles.sectionTitle, {color: colors.secondaryText}]}>
                  Notes
                </Text>
                <Text style={[styles.notes, {color: colors.text}]}>
                  {password.notes}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </>
  );
};

const DetailRow = ({label, value, icon, onPress, onIconPress, colors}) => (
  <TouchableOpacity
    style={styles.detailRow}
    onPress={onPress}
    activeOpacity={0.7}>
    <Icon name={icon} size={24} color={colors.secondaryText} />
    <View style={styles.detailContent}>
      <Text style={[styles.detailLabel, {color: colors.secondaryText}]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, {color: colors.text}]}>{value}</Text>
    </View>
    {onIconPress && (
      <TouchableOpacity onPress={onIconPress}>
        <Icon name="eye" size={24} color={colors.primary} />
      </TouchableOpacity>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailContent: {
    flex: 1,
    marginLeft: 15,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 16,
    marginTop: 2,
  },
  notes: {
    fontSize: 14,
    lineHeight: 22,
  },
  authModal: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
  },
  authInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  authButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  authButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  authError: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default PasswordDetailScreen;
