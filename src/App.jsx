import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {ActivityIndicator, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import 'react-native-get-random-values';

// Contexts
import {ThemeContext, ThemeProvider} from './contexts/ThemeContext';
import {AuthProvider, useAuth} from './contexts/AuthContext';
import {SuperKeyProvider} from './contexts/SuperKeyContext';

// Screens
import OnboardingScreen from './screens/OnboardingScreen';
import AuthScreen from './screens/AuthScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/Home/HomeScreen';
import PasswordManagerScreen from './screens/Passwords/PasswordManagerScreen';
import PasswordDetailScreen from './screens/Passwords/PasswordDetailScreen';
import EditPasswordScreen from './screens/Passwords/EditPasswordScreen';
import ChatScreen from './screens/Chat/ChatScreen';
import ContactsScreen from './screens/Chat/ContactsScreen';
import SettingsScreen from './screens/Settings/SettingsScreen';
import CreateSuperKeyScreen from './screens/Passwords/CreateSuperKeyScreen';
import ChangePasswordScreen from './screens/Settings/ChangePasswordScreen';
import ExportDataScreen from './screens/Settings/ExportDataScreen';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main app navigator
const AppNavigator = () => {
  const {colors} = React.useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Passwords') {
            iconName = focused ? 'lock' : 'lock-outline';
          } else if (route.name === 'CreateKey') {
            iconName = focused ? 'lock' : 'lock-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'message' : 'message-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          elevation: 8,
        },
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Passwords" component={PasswordManagerScreen} />
      <Tab.Screen name="CreateKey" component={CreateSuperKeyScreen} />
      <Tab.Screen name="Chat" component={ContactsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const AuthenticatedStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="App" component={AppNavigator} />
      <Stack.Screen
        name="PasswordDetail"
        component={PasswordDetailScreen}
        options={{presentation: 'modal'}}
      />
      <Stack.Screen
        name="EditPassword"
        component={EditPasswordScreen}
        options={{presentation: 'modal'}}
      />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="ExportData" component={ExportDataScreen} />
    </Stack.Navigator>
  );
};

const UnauthenticatedStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
};

const MainApp = () => {
  const {user, isLoading} = useAuth();

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AuthenticatedStack /> : <UnauthenticatedStack />}
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SuperKeyProvider>
          <MainApp />
        </SuperKeyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
