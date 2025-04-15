import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import auth from '@react-native-firebase/auth';

const HomeScreen = ({navigation}) => {
  const user = auth().currentUser;

  return (
    <View style={styles.container}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <Image
          source={{uri: 'https://via.placeholder.com/100'}}
          style={styles.profileImage}
        />
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput style={styles.searchInput} placeholder="Search..." />
        <Icon name="search" size={20} color="#000" />
      </View>

      {/* Middle Section */}
      <View style={styles.middleSection}>
        <TouchableOpacity
          style={styles.featureBox}
          onPress={() => navigation.navigate('CreateSuperKey')}>
          <Text style={styles.featureText}>Create Super Keys</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.featureBox}
          onPress={() => navigation.navigate('PasswordManager')}>
          <Text style={styles.featureText}>Password Manager</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.featureBox}
          onPress={() => navigation.navigate('RetrievePasswords')}>
          <Text style={styles.featureText}>Retrieve Passwords</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.featureBox}
          onPress={() => navigation.navigate('AddNewFeature')}>
          <Text style={styles.featureText}>Add New Feature</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  email: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginRight: 10,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  featureBox: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  featureText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
