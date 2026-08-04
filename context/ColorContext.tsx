'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ColorContextType {
  currentColor: string;
  setColor: (color: string) => void;
  recentColors: string[];
  addRecentColor: (color: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: ReactNode }) {
  const [currentColor, setCurrentColor] = useState<string>('8B5CF6');
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load recent colors from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentColors');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentColors(parsed);
        }
      } catch (e) {
        console.error('Failed to parse recent colors:', e);
      }
    }
  }, []);

  // Save recent colors to localStorage when updated
  useEffect(() => {
    if (recentColors.length > 0) {
      localStorage.setItem('recentColors', JSON.stringify(recentColors));
    }
  }, [recentColors]);

  const setColor = (color: string) => {
    // Remove # if present and ensure it's 6 characters
    const cleanColor = color.replace('#', '').toLowerCase();
    if (cleanColor.length === 3) {
      // Expand 3-digit hex to 6-digit
      const expanded = cleanColor.split('').map(c => c + c).join('');
      setCurrentColor(expanded);
      addRecentColor(expanded);
    } else if (cleanColor.length === 6) {
      setCurrentColor(cleanColor);
      addRecentColor(cleanColor);
    } else {
      console.warn('Invalid color format:', color);
    }
  };

  const addRecentColor = (color: string) => {
    setRecentColors(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(c => c !== color);
      // Add to beginning, keep last 10
      return [color, ...filtered].slice(0, 10);
    });
  };

  return (
    <ColorContext.Provider 
      value={{ 
        currentColor, 
        setColor, 
        recentColors, 
        addRecentColor,
        isLoading,
        setIsLoading
      }}
    >
      {children}
    </ColorContext.Provider>
  );
}

export function useColor() {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error('useColor must be used within a ColorProvider');
  }
  return context;
}