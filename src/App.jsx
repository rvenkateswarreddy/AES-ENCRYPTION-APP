import React, {useEffect, useState, createContext} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import OnboardingScreen from './screens/OnboardingScreen';
import AuthScreen from './screens/AuthScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import AppNavigator from './navigation/AppNavigator';
import 'react-native-get-random-values';
import CreateSuperKeyScreen from './passwordmanager/CreateSuperKey';
import PasswordManager from './passwordmanager/PasswordManager';
import RetrievePasswordsScreen from './screens/RetrievePasswords';
// Create AuthContext
export const AuthContext = createContext();

const Stack = createNativeStackNavigator();

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check AsyncStorage for a saved token on app start
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          // If token exists, set the user
          setUser({token});
        }
      } catch (error) {
        console.error('Error fetching token from AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  // Handle Firebase auth state changes
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        // Generate a token (or use Firebase ID token)
        const token = await firebaseUser.getIdToken();
        // Save token to AsyncStorage
        await AsyncStorage.setItem('userToken', token);
        // Set user in state
        setUser({...firebaseUser, token});
      } else {
        // Clear token from AsyncStorage and reset user state
        await AsyncStorage.removeItem('userToken');
        setUser(null);
      }
    });

    return subscriber; // Unsubscribe on unmount
  }, []);

  if (loading) {
    return null; // Show a splash screen or loading spinner
  }

  return (
    <AuthContext.Provider value={{user, setUser}}>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            // User is logged in, show the main app
            <>
              <Stack.Screen
                name="App"
                component={AppNavigator}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="CreateSuperKey"
                component={CreateSuperKeyScreen}
              />
              <Stack.Screen
                name="PasswordManager"
                component={PasswordManager}
              />
              <Stack.Screen
                name="RetrievePasswords"
                component={RetrievePasswordsScreen}
              />
            </>
          ) : (
            // User is not logged in, show onboarding and auth screens
            <>
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Auth"
                component={AuthScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Signup"
                component={SignupScreen}
                options={{headerShown: false}}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export default App;
