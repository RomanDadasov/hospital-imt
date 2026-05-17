import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useDarkMode = create(persist(
  (set, get) => ({
    isDarkmodeActive: false,
    toggleDarkmode: () => {
      const newState = !get().isDarkmodeActive
      set({ isDarkmodeActive: newState })
      if (newState) {
        document.documentElement.classList.add('dark-mode-active')
      } else {
        document.documentElement.classList.remove('dark-mode-active')
      }
    },
    setDarkmode: (value) => {
      set({ isDarkmodeActive: value })
      if (value) {
        document.documentElement.classList.add('dark-mode-active')
      } else {
        document.documentElement.classList.remove('dark-mode-active')
      }
    }
  }),
  {
    name: "hospital-darkmode",
    onRehydrateStorage: () => (state) => {
      if (state?.isDarkmodeActive) {
        document.documentElement.classList.add('dark-mode-active')
      }
    }
  }
))