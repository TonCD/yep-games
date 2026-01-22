import { useCallback, useRef } from 'react';

interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

export const useSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((url: string, options: SoundOptions = {}) => {
    try {
      // Stop previous sound if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio = new Audio(url);
      audio.volume = options.volume ?? 0.5;
      audio.loop = options.loop ?? false;
      
      audioRef.current = audio;
      
      audio.play().catch((error) => {
        console.warn('Audio play failed:', error);
      });

      return audio;
    } catch (error) {
      console.warn('Failed to create audio:', error);
      return null;
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }, []);

  const fadeOut = useCallback((duration: number = 1000) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const initialVolume = audio.volume;
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = initialVolume / steps;

    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(0, initialVolume - (volumeStep * currentStep));

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audio.pause();
        audio.currentTime = 0;
      }
    }, stepTime);
  }, []);

  return { play, stop, fadeOut };
};

// Pre-defined sound URLs (local sounds from public/sounds/)
export const SOUNDS = {
  // Lucky Wheel
  wheelSpin: '/sounds/spin_3s.mp3',        // Spinning sound (3s)
  wheelWin: '/sounds/victory_3s.mp3',      // Winner sound (3s)
  
  // Bingo
  bingoClick: '/sounds/success_1s.mp3',    // Soft success sound (1s)
  
  // Results
  confetti: '/sounds/victory_3s.mp3',      // Victory/fireworks (3s)
  applause: '/sounds/applause_26s.mp3',    // Applause (26s)
  drumroll: '/sounds/drumroll_4s.mp3',     // Suspense drumroll (4s)
  swoosh: '/sounds/swoosh_1s.mp3',         // Swoosh for rank reveal (1s)
  
  // UI
  success: '/sounds/success_1s.mp3',       // Success tone (1s)
  error: '/sounds/error_1s.mp3',           // Error tone (1s)
};
