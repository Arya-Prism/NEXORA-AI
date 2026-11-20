import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'emerald' | 'midnight';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'emerald',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('nexora_theme');
    return (saved as ThemeMode) || 'emerald';
  });

  useEffect(() => {
    localStorage.setItem('nexora_theme', theme);
    const root = document.documentElement;

    if (theme === 'midnight') {
      root.classList.add('dark');
      root.classList.add('theme-midnight');
      root.classList.remove('theme-emerald');
    } else {
      root.classList.remove('dark');
      root.classList.add('theme-emerald');
      root.classList.remove('theme-midnight');
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'emerald' ? 'midnight' : 'emerald'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
