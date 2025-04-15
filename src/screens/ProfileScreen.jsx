import React, {useContext} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AuthContext} from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const {user, setUser} = useContext(AuthContext);

  const handleLogout = async () => {
    // Clear token from AsyncStorage
    await AsyncStorage.removeItem('userToken');
    // Reset user state
    setUser(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Icon name="person" size={100} color="#000" />
        <Text style={styles.name}>{user?.displayName || 'User Name'}</Text>
        <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
      </View>
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option}>
          <Icon name="settings" size={30} color="#000" />
          <Text style={styles.optionText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Icon name="logout" size={30} color="#000" />
          <Text style={styles.optionText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  profileContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  email: {
    fontSize: 18,
    color: '#888',
    marginTop: 5,
  },
  optionsContainer: {
    width: '80%',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionText: {
    fontSize: 18,
    marginLeft: 10,
  },
});

export default ProfileScreen;
