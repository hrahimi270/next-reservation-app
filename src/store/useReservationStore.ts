import { create } from "zustand";

type Store = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};

export const useReservationStore = create<Store>()((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (newDate) => set(() => ({ selectedDate: newDate })),
}));
