import React, {createContext, useState, useContext} from 'react';

const SuperKeyContext = createContext();

export const SuperKeyProvider = ({children}) => {
  const [superKey, setSuperKey] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  console.log(isAuthenticated, 'isAuthenticated');

  return (
    <SuperKeyContext.Provider
      value={{superKey, setSuperKey, isAuthenticated, setIsAuthenticated}}>
      {children}
    </SuperKeyContext.Provider>
  );
};

export const useSuperKey = () => useContext(SuperKeyContext);
