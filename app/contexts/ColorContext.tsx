'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ColorContextType {
  currentColor: string;
  setColor: (color: string) => void;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: ReactNode }) {
  const [currentColor, setCurrentColor] = useState<string>('8B5CF6');

  const setColor = (color: string) => {
    const cleanColor = color.replace('#', '').toLowerCase();
    if (cleanColor.length === 3) {
      const expanded = cleanColor.split('').map(c => c + c).join('');
      setCurrentColor(expanded);
    } else if (cleanColor.length === 6) {
      setCurrentColor(cleanColor);
    }
  };

  return (
    <ColorContext.Provider value={{ currentColor, setColor }}>
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