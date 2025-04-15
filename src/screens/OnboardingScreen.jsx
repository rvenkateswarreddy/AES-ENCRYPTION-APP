import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

const OnboardingScreen = ({navigation}) => {
  return (
    <Onboarding
      pages={[
        {
          backgroundColor: '#fff',
          image: <Text>Feature 1</Text>,
          title: 'Feature 1',
          subtitle: 'Description of Feature 1',
        },
        {
          backgroundColor: '#fff',
          image: <Text>Feature 2</Text>,
          title: 'Feature 2',
          subtitle: 'Description of Feature 2',
        },
        {
          backgroundColor: '#fff',
          image: <Text>Feature 3</Text>,
          title: 'Feature 3',
          subtitle: 'Description of Feature 3',
        },
      ]}
      onDone={() => navigation.navigate('Auth')}
    />
  );
};

export default OnboardingScreen;
