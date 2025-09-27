import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define theme colors
export const THEME_COLORS = [
  { name: 'Orange', value: '243 75% 59%', class: 'orange-500' },
  { name: 'Blue', value: '217.2 91.2% 59.8%', class: 'blue-500' },
  { name: 'Green', value: '142.1 76.2% 36.3%', class: 'green-500' },
  { name: 'Purple', value: '262.1 83.3% 57.8%', class: 'purple-500' },
  { name: 'Red', value: '0 84.2% 60.2%', class: 'red-500' },
  { name: 'Pink', value: '330.4 81.2% 60.4%', class: 'pink-500' },
  { name: 'Indigo', value: '239.5 84% 67.8%', class: 'indigo-500' },
  { name: 'Teal', value: '173.4 80.4% 40%', class: 'teal-500' },
  { name: 'Cyan', value: '188.7 94.5% 43.3%', class: 'cyan-500' },
  { name: 'Emerald', value: '158.1 64.4% 51.6%', class: 'emerald-500' }
];

export const DEFAULT_THEME = THEME_COLORS[0];

interface ThemeContextType {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  resetToDefault: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [primaryColor, setPrimaryColorState] = useState<string>(DEFAULT_THEME.value);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('primaryColor');
    if (savedTheme) {
      setPrimaryColorState(savedTheme);
    }
  }, []);

  // Update CSS custom property when theme changes
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
  }, [primaryColor]);

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    localStorage.setItem('primaryColor', color);
  };

  const resetToDefault = () => {
    setPrimaryColor(DEFAULT_THEME.value);
  };

  return (
    <ThemeContext.Provider value={{
      primaryColor,
      setPrimaryColor,
      resetToDefault
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
