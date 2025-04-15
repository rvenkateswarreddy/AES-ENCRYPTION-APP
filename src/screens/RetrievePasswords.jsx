import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import CryptoJS from 'crypto-js';
import 'react-native-get-random-values';

const RetrievePasswords = ({navigation}) => {
  const [superKey, setSuperKey] = useState('');
  const [entries, setEntries] = useState([]);
  const [decryptedPasswords, setDecryptedPasswords] = useState({});

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const user = auth().currentUser;
        const snapshot = await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('passwords')
          .get();
        const retrievedEntries = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEntries(retrievedEntries);
      } catch (error) {
        console.error('Error fetching entries:', error);
      }
    };

    fetchEntries();
  }, []);

  const handleRetrievePassword = (id, encryptedPassword) => {
    try {
      const decryptedPassword = CryptoJS.AES.decrypt(
        encryptedPassword,
        superKey,
      ).toString(CryptoJS.enc.Utf8);
      setDecryptedPasswords(prevState => ({
        ...prevState,
        [id]: decryptedPassword,
      }));
    } catch (error) {
      console.error('Error decrypting password:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Retrieve Passwords</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Super Key"
        secureTextEntry
        value={superKey}
        onChangeText={setSuperKey}
      />
      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.listItem}>
            <Text style={styles.websiteText}>{item.website}</Text>
            {decryptedPasswords[item.id] ? (
              <Text style={styles.passwordText}>
                {decryptedPasswords[item.id]}
              </Text>
            ) : (
              <TouchableOpacity
                style={styles.retrieveButton}
                onPress={() => handleRetrievePassword(item.id, item.password)}>
                <Text style={styles.retrieveButtonText}>Retrieve Password</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
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
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  websiteText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  passwordText: {
    fontSize: 16,
    color: 'green',
    marginTop: 10,
  },
  retrieveButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  retrieveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default RetrievePasswords;
