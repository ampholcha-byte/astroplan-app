'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Coordinates } from '@/types';

interface LocationContextType {
  location: Coordinates | null;
  coords: { lat: number; lng: number };
  setLocation: (coords: Coordinates) => void;
  setCoords: (lat: number, lng: number) => void;
}

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<Coordinates | null>(null);
  const [coords, setCoordsState] = useState({ lat: 13.7563, lng: 100.5018 });

  const setLocation = useCallback((newCoords: Coordinates) => {
    setLocationState(newCoords);
    setCoordsState({ lat: newCoords.lat, lng: newCoords.lng });
  }, []);

  const setCoords = useCallback((lat: number, lng: number) => {
    setCoordsState({ lat, lng });
  }, []);

  return (
    <LocationContext.Provider value={{ location, coords, setLocation, setCoords }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
