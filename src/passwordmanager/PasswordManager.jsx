import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import CryptoJS from 'crypto-js';
import 'react-native-get-random-values';

const PasswordManager = ({navigation}) => {
  const [website, setWebsite] = useState('');
  const [password, setPassword] = useState('');
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const user = auth().currentUser;
      const snapshot = await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('passwords')
        .get();
      setEntries(snapshot.docs.map(doc => doc.data()));
    };

    fetchEntries();
  }, []);

  const handleSave = async () => {
    try {
      const user = auth().currentUser;
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const superKey = userDoc.data().superKey;
      const encryptedPassword = CryptoJS.AES.encrypt(
        password,
        superKey,
      ).toString();

      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('passwords')
        .add({
          website: website,
          password: encryptedPassword,
        });

      setEntries([...entries, {website, password: encryptedPassword}]);
      setWebsite('');
      setPassword('');
    } catch (error) {
      console.error('Error saving password:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Password Manager</Text>
      <TextInput
        style={styles.input}
        placeholder="Website/App Name"
        value={website}
        onChangeText={setWebsite}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Save" onPress={handleSave} />
      <FlatList
        data={entries}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <View style={styles.listItem}>
            <Text>{item.website}</Text>
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
});

export default PasswordManager;
