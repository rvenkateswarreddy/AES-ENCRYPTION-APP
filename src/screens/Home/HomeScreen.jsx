import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../../contexts/ThemeContext';

const HomeScreen = ({navigation}) => {
  const {colors} = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={[styles.title, {color: colors.text}]}>
        Welcome to Secure Vault
      </Text>

      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={[styles.card, {backgroundColor: colors.primary}]}
          onPress={() => navigation.navigate('Passwords')}>
          <Icon name="lock" size={40} color="#fff" />
          <Text style={styles.cardTitle}>Passwords</Text>
          <Text style={styles.cardText}>Manage your secure passwords</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, {backgroundColor: colors.secondary}]}
          onPress={() => navigation.navigate('Chat')}>
          <Icon name="message" size={40} color="#fff" />
          <Text style={styles.cardTitle}>Secure Chat</Text>
          <Text style={styles.cardText}>Send encrypted messages</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, {backgroundColor: colors.card}]}>
          <Icon name="shield-check" size={24} color={colors.primary} />
          <Text style={[styles.statValue, {color: colors.text}]}>256-bit</Text>
          <Text style={[styles.statLabel, {color: colors.secondaryText}]}>
            Encryption
          </Text>
        </View>

        <View style={[styles.statCard, {backgroundColor: colors.card}]}>
          <Icon name="lock" size={24} color={colors.primary} />
          <Text style={[styles.statValue, {color: colors.text}]}>
            Zero-Knowledge
          </Text>
          <Text style={[styles.statLabel, {color: colors.secondaryText}]}>
            Security
          </Text>
        </View>
      </View>
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
    marginBottom: 24,
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  cardText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 14,
  },
});

export default HomeScreen;
