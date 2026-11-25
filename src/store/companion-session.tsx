import { createContext, useContext, useState, type PropsWithChildren } from 'react';

import type { CompanionBooking } from '@/services/companion-booking';

type CompanionSession = {
  bookings: Partial<Record<string, CompanionBooking>>;
  favorites: string[];
  recordBooking: (id: string, booking: CompanionBooking) => void;
  toggleFavorite: (id: string) => void;
};

const CompanionSessionContext = createContext<CompanionSession | null>(null);

export function CompanionSessionProvider({ children }: PropsWithChildren) {
  const [bookings, setBookings] = useState<CompanionSession['bookings']>({});
  const [favorites, setFavorites] = useState<string[]>([]);

  function recordBooking(id: string, booking: CompanionBooking) {
    setBookings(current => current[id] ? current : { ...current, [id]: booking });
  }

  function toggleFavorite(id: string) {
    setFavorites(current => current.includes(id) ? current.filter(favorite => favorite !== id) : [...current, id]);
  }

  return (
    <CompanionSessionContext.Provider value={{ bookings, favorites, recordBooking, toggleFavorite }}>
      {children}
    </CompanionSessionContext.Provider>
  );
}

export function useCompanionSession() {
  const session = useContext(CompanionSessionContext);
  if (!session) throw new Error('Companion screens require CompanionSessionProvider.');
  return session;
}
