import { createContext, useContext, useState } from 'react';
import { COUNTRY_CONFIGS } from '../data/countryConfigs';

const CountryContext = createContext();

export function CountryProvider({ children }) {
  const [country, setCountry] = useState('IN');

  const value = {
    country,
    setCountry,
    config: COUNTRY_CONFIGS[country]
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  return useContext(CountryContext);
}
