import React, {useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../../contexts/ThemeContext';
import auth from '@react-native-firebase/auth';
import {useAuth} from '../../contexts/AuthContext';

const SettingsScreen = ({navigation}) => {
  const {colors, isDark, toggleTheme} = useTheme();
  const {user, setUser} = useAuth();

  const handleLogout = async () => {
    try {
      await auth().signOut();
      setUser(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
      console.error(error);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This cannot be undone.',
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
              await auth().currentUser.delete();
              setUser(null);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account');
              console.error(error);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={[styles.title, {color: colors.text}]}>Settings</Text>

      <View style={[styles.section, {backgroundColor: colors.card}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Appearance
        </Text>

        <View style={styles.settingItem}>
          <Icon name="theme-light-dark" size={24} color={colors.primary} />
          <Text style={[styles.settingText, {color: colors.text}]}>
            Dark Mode
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            thumbColor={colors.primary}
            trackColor={{true: colors.primary, false: colors.border}}
          />
        </View>
      </View>

      <View style={[styles.section, {backgroundColor: colors.card}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>Account</Text>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate('ChangePassword')}>
          <Icon name="lock-reset" size={24} color={colors.primary} />
          <Text style={[styles.settingText, {color: colors.text}]}>
            Change Password
          </Text>
          <Icon name="chevron-right" size={24} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>

      <View style={[styles.section, {backgroundColor: colors.card}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Security
        </Text>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate('ExportData')}>
          <Icon name="export" size={24} color={colors.primary} />
          <Text style={[styles.settingText, {color: colors.text}]}>
            Export Data
          </Text>
          <Icon name="chevron-right" size={24} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, {backgroundColor: colors.card}]}
        onPress={handleLogout}>
        <Text style={[styles.logoutText, {color: colors.error}]}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.deleteButton, {backgroundColor: colors.card}]}
        onPress={handleDeleteAccount}>
        <Text style={[styles.deleteText, {color: colors.error}]}>
          Delete Account
        </Text>
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
    marginBottom: 16,
  },
  section: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
