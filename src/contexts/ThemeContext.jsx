import React, {createContext, useContext, useState} from 'react';

const lightTheme = {
  primary: '#6200EE',
  primaryLight: '#9E47FF',
  primaryDark: '#0400BA',
  secondary: '#03DAC6',
  secondaryLight: '#66FFF9',
  secondaryDark: '#00A895',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#000000',
  secondaryText: '#757575',
  placeholder: '#9E9E9E',
  border: '#E0E0E0',
  inputBackground: '#FAFAFA',
  error: '#B00020',
  success: '#4CAF50',
  warning: '#FF9800',
  disabled: '#BDBDBD',
};

const darkTheme = {
  primary: '#BB86FC',
  primaryLight: '#E1BFFF',
  primaryDark: '#3700B3',
  secondary: '#03DAC6',
  secondaryLight: '#66FFF9',
  secondaryDark: '#00A895',
  background: '#121212',
  card: '#1E1E1E',
  text: '#E0E0E0',
  secondaryText: '#A0A0A0',
  placeholder: '#616161',
  border: '#333333',
  inputBackground: '#2A2A2A',
  error: '#CF6679',
  success: '#4CAF50',
  warning: '#FF9800',
  disabled: '#424242',
};

export const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
  const [isDark, setIsDark] = useState(false);
  const colors = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{colors, isDark, toggleTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
