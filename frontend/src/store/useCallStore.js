import { create } from 'zustand';

export const useCallStore = create((set, get) => ({
  isInitiator: false,
  pendingOffer: null,
  inCallwith:null,
  setInCallWith:(val)=>set({inCallwith:val}),
  setIsInitiator: (val) => set({ isInitiator: val }),
  setPendingOffer: (offer) => set({ pendingOffer: offer }),
  clearPendingOffer: () => set({ pendingOffer: null }),
  clearCall:()=> set({ isInitiator: false, pendingOffer: null,inCallwith:null }),
}));