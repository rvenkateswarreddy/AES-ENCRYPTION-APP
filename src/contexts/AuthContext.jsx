import React, {createContext, useState, useContext, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import {Alert} from 'react-native';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(currentUser => {
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      setUser(userCredential.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Login Failed', error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password) => {
    try {
      setIsLoading(true);
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      setUser(userCredential.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      Alert.alert('Registration Failed', error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await auth().signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Logout Failed', error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
