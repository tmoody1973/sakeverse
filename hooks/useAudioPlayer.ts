"use client"

import { create } from "zustand"

interface Episode {
  id: string
  title: string
  series: string
  audioUrl: string
  duration: number
}

interface AudioPlayerState {
  currentEpisode: Episode | null
  isPlaying: boolean
  currentTime: number
  duration: number
  setEpisode: (episode: Episode) => void
  play: () => void
  pause: () => void
  toggle: () => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  clear: () => void
}

export const useAudioPlayer = create<AudioPlayerState>((set, get) => ({
  currentEpisode: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  setEpisode: (episode) => set({ currentEpisode: episode, currentTime: 0, isPlaying: true }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set({ isPlaying: !get().isPlaying }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  clear: () => set({ currentEpisode: null, isPlaying: false, currentTime: 0, duration: 0 }),
}))
