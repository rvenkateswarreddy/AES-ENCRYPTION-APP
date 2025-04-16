import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../../contexts/ThemeContext';
import firestore from '@react-native-firebase/firestore';
import {useAuth} from '../../contexts/AuthContext';

const ContactsScreen = ({navigation}) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const {colors} = useTheme();
  const {user} = useAuth();

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('users')
      .where('uid', '!=', user.uid)
      .onSnapshot(snapshot => {
        const users = [];
        snapshot.forEach(doc => {
          users.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setContacts(users);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={[styles.contactItem, {backgroundColor: colors.card}]}
      onPress={() =>
        navigation.navigate('ChatScreen', {
          userId: item.uid,
          userName: item.name,
        })
      }>
      <View style={styles.avatar}>
        <Icon name="account" size={32} color={colors.primary} />
      </View>
      <Text style={[styles.contactName, {color: colors.text}]}>
        {item.name}
      </Text>
      <Icon name="chevron-right" size={24} color={colors.secondaryText} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={[styles.title, {color: colors.text}]}>Contacts</Text>

      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, {color: colors.secondaryText}]}>
              No contacts found
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
  },
});

export default ContactsScreen;
