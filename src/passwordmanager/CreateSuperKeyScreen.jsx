import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import 'react-native-get-random-values';

const CreateSuperKeyScreen = ({navigation}) => {
  const [superKey, setSuperKey] = useState('');

  const handleCreate = async () => {
    try {
      const user = auth().currentUser;
      await firestore().collection('users').doc(user.uid).set(
        {
          superKey: superKey,
        },
        {merge: true},
      );
      console.log('Super Key Created:', superKey);
      navigation.goBack();
    } catch (error) {
      console.error('Error creating super key:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Super Key</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Super Key"
        secureTextEntry
        value={superKey}
        onChangeText={setSuperKey}
      />
      <Button title="Create" onPress={handleCreate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
});

export default CreateSuperKeyScreen;
