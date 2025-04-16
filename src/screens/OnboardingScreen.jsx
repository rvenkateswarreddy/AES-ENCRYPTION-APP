import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../contexts/ThemeContext';

const OnboardingScreen = ({navigation}) => {
  const {colors} = useTheme();

  const DoneButton = ({...props}) => (
    <TouchableOpacity
      style={[styles.doneButton, {backgroundColor: colors.primary}]}
      {...props}>
      <Text style={styles.doneButtonText}>Get Started</Text>
    </TouchableOpacity>
  );

  return (
    <Onboarding
      pages={[
        {
          backgroundColor: colors.background,
          image: <Icon name="shield-lock" size={100} color={colors.primary} />,
          title: 'Secure Password Manager',
          titleStyles: {color: colors.text, fontWeight: 'bold'},
          subTitle:
            'Store all your passwords securely with military-grade encryption',
          subTitleStyles: {color: colors.secondaryText},
        },
        {
          backgroundColor: colors.background,
          image: <Icon name="chat" size={100} color={colors.primary} />,
          title: 'Encrypted Messaging',
          titleStyles: {color: colors.text, fontWeight: 'bold'},
          subTitle: 'Send end-to-end encrypted messages to other users',
          subTitleStyles: {color: colors.secondaryText},
        },
        {
          backgroundColor: colors.background,
          image: <Icon name="key" size={100} color={colors.primary} />,
          title: 'Your Super Key',
          titleStyles: {color: colors.text, fontWeight: 'bold'},
          subTitle: 'Create a master password that encrypts all your data',
          subTitleStyles: {color: colors.secondaryText},
        },
      ]}
      onDone={() => navigation.navigate('Auth')}
      DoneButtonComponent={DoneButton}
      bottomBarColor={colors.background}
      titleStyles={{color: colors.text}}
      subTitleStyles={{color: colors.secondaryText}}
    />
  );
};

const styles = StyleSheet.create({
  doneButton: {
    padding: 15,
    borderRadius: 8,
    marginRight: 15,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
