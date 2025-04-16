import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../../contexts/ThemeContext';
import {AuthContext} from '../../App';
import firestore from '@react-native-firebase/firestore';
import CryptoJS from 'crypto-js';
import 'react-native-get-random-values';

const ExportDataScreen = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const {colors} = useTheme();
  const {user} = useContext(AuthContext);

  const handleExport = async () => {
    try {
      setLoading(true);

      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const derivedKey = userDoc.data()?.encryption?.derivedKey;

      if (!derivedKey) {
        Alert.alert('Error', 'No encryption key found');
        return;
      }

      // Get all passwords
      const snapshot = await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('passwords')
        .get();

      const decryptedPasswords = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        try {
          const decrypted = CryptoJS.AES.decrypt(
            data.encryptedData,
            derivedKey,
          ).toString(CryptoJS.enc.Utf8);
          if (decrypted) {
            decryptedPasswords.push(JSON.parse(decrypted));
          }
        } catch (error) {
          console.error('Decryption error:', error);
        }
      }

      // In a real app, you would save this to a file or share it
      console.log('Exported data:', decryptedPasswords);

      Alert.alert(
        'Export Complete',
        'Your data has been prepared for export. In a real app, this would be saved to a file.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={[styles.title, {color: colors.text}]}>Export Data</Text>
      <Text style={[styles.description, {color: colors.secondaryText}]}>
        Export all your passwords and data in an encrypted format. You'll need
        your super key to decrypt this data.
      </Text>

      <TouchableOpacity
        style={[styles.exportButton, {backgroundColor: colors.primary}]}
        onPress={handleExport}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Icon
              name="export"
              size={24}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.exportButtonText}>Export Data</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={[styles.warning, {color: colors.error}]}>
        Warning: Keep this data secure. Anyone with access to this file and your
        super key can access your passwords.
      </Text>
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
  description: {
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 24,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonIcon: {
    marginRight: 10,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  warning: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ExportDataScreen;
