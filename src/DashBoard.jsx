import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RefreshCw, Plus, Minus, Settings, X, ChevronsUpDown,
  Check, Image as ImageIcon, CheckCircle, AlertCircle, Upload, Sun, Moon,
  Type, Trash2
} from 'lucide-react';
import {
  FaRegClock, FaRegHourglass
} from 'react-icons/fa6';
import { IoColorPaletteOutline, IoMusicalNotesOutline } from "react-icons/io5";
import {
  IoSettingsOutline, IoTimerOutline

} from 'react-icons/io5';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import * as Tone from 'tone';

// --- Setup Libs ---
dayjs.extend(utc);
dayjs.extend(timezone);

// --- Timezones ---
let allTimezones = [];
try {
  allTimezones = Intl.supportedValuesOf('timeZone');
} catch (e) {
  allTimezones = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney'];
}
const kolkata = 'Asia/Kolkata';
if (allTimezones.includes(kolkata)) {
  allTimezones = [kolkata, ...allTimezones.filter(tz => tz !== kolkata)];
} else {
  allTimezones = [kolkata, ...allTimezones];
}
const TIMEZONES = allTimezones;


// --- Constants ---
const TABS = {
  POMODORO: 'POMODORO',
  TIME: 'TIME',
  TIMER: 'TIMER',
};

const POMO_MODES = {
  POMODORO: 'pomodoro',
  SHORT: 'shortBreak',
  LONG: 'longBreak',
};

const SOUNDS = [
  {
    category: 'Alarms', options: [
      { id: 'track1', name: 'Digital Alarm', file: 'https://assets.mixkit.co/active_storage/sfx/213/213-preview.mp3' },
      { id: 'track2', name: 'Short Beep', file: 'https://assets.mixkit.co/active_storage/sfx/39/39-preview.mp3' },
      { id: 'track3', name: 'Notification', file: 'https://assets.mixkit.co/active_storage/sfx/1714/1714-preview.mp3' },
      { id: 'track4', name: 'Bell Ring', file: 'https://assets.mixkit.co/active_storage/sfx/166/166-preview.mp3' },
      { id: 'track5', name: 'Positive Ping', file: 'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3' },
      { id: 'track6', name: 'Retro Alert', file: 'http://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3' },
      { id: 'track7', name: 'Game Coin', file: 'https://assets.mixkit.co/active_storage/sfx/488/488-preview.mp3' },
      { id: 'track8', name: 'Digital Chime', file: 'https://assets.mixkit.co/active_storage/sfx/1486/1486-preview.mp3' },
      { id: 'track9', name: 'Interface Beep', file: 'https://assets.mixkit.co/active_storage/sfx/532/532-preview.mp3' },
    ]
  },
  {
    category: 'Custom', options: [
      { id: 'custom', name: 'Custom (Upload)', file: 'custom' },
    ]
  },
  {
    category: 'System', options: [
      { id: 'tts', name: 'Text-to-Speech', file: 'tts' },
      { id: 'none', name: 'None', file: null },
    ]
  }
];

const ALL_SOUNDS_MAP = new Map(
  SOUNDS.flatMap(group => group.options.map(opt => [opt.id, opt]))
);

const THEMES = [
  { name: 'Deep Space', value: 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' },
  { name: 'Oceanic', value: 'bg-gradient-to-br from-blue-900 to-teal-800' },
  { name: 'Sunset', value: 'bg-gradient-to-br from-red-800 via-yellow-700 to-orange-900' },
  { name: 'Forest', value: 'bg-gradient-to-br from-green-900 to-lime-800' },
  { name: 'Crimson', value: 'bg-gradient-to-br from-red-900 to-red-500' },
  { name: 'Sunrise', value: 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500' },
  { name: 'Midnight', value: 'bg-gradient-to-br from-gray-800 via-gray-900 to-black' },
  { name: 'Aurora', value: 'bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600' },
];

const TIME_BASED_THEMES = {
  morning: 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500', // Sunrise
  afternoon: 'bg-gradient-to-br from-blue-900 to-teal-800', // Oceanic
  evening: 'bg-gradient-to-br from-red-800 via-yellow-700 to-orange-900', // Sunset
  night: 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900', // Deep Space
};

// --- Clock Themes ---
const DIGITAL_CLOCK_THEMES = [
  { id: 'default', name: 'Default', value: 'font-light font-mono text-white' },
  { id: 'neon', name: 'Neon', value: 'font-mono text-cyan-400' },
  { id: 'retro', name: 'Retro', value: 'font-mono text-orange-400' },
  { id: 'serif', name: 'Serif', value: 'font-serif text-white' },
  { id: 'bold', name: 'Bold', value: 'font-bold text-white' },
  { id: 'italic', name: 'Italic', value: 'font-serif italic text-white' },
  { id: 'matrix', name: 'Matrix', value: 'font-mono text-green-500' },
  { id: 'thin', name: 'Thin', value: 'font-thin text-white' },
  { id: 'gold', name: 'Gold', value: 'font-serif font-bold text-yellow-500' },
  { id: 'pink', name: 'Pink', value: 'font-sans font-bold text-pink-500' },
];

const ANALOG_CLOCK_THEMES = [
  { id: 'classic', name: 'Classic' },
  { id: 'modern', name: 'Modern' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'ocean', name: 'Ocean' },
  { id: 'forest', name: 'Forest' },
  { id: 'neon', name: 'Neon' },
  { id: 'royal', name: 'Royal' },
  { id: 'crimson', name: 'Crimson' },
  { id: 'stealth', name: 'Stealth' },
  { id: 'simple', name: 'Simple' },
];

const MOTIVATIONAL_QUOTES = [
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "The only way to do great work is to love what you do.",
  "Focus on being productive instead of busy.",
  "You are capable of more than you know.",
  "A little progress each day adds up to big results.",
  "Believe you can and you're halfway there.",
  "The future depends on what you do today."
];

const DEFAULT_SETTINGS = {
  timers: {
    [POMO_MODES.POMODORO]: 25,
    [POMO_MODES.SHORT]: 5,
    [POMO_MODES.LONG]: 15,
  },
  sound: 'track1',
  volume: 0,
  ttsText: 'Timer complete',
  clock: {
    type: 'digital',
    timezone: dayjs.tz.guess(),
    format: '24h',
    digitalTheme: DIGITAL_CLOCK_THEMES[0].value,
    analogTheme: ANALOG_CLOCK_THEMES[0].id,
  },
  theme: {
    type: 'gradient',
    value: THEMES[0].value,
    brightness: 100,
    auto: false,
  },
};


// --- Audio Player ---
const alarmVolume = new Tone.Volume(DEFAULT_SETTINGS.volume).toDestination();
const customPlayer = new Tone.Player().connect(alarmVolume);
const filePlayer = new Tone.Player().connect(alarmVolume);
let currentSoundFile = null;

const playSound = (soundId, ttsText = 'Timer complete') => {
  Tone.start();
  const sound = ALL_SOUNDS_MAP.get(soundId);
  if (!sound) return;

  if (sound.id === 'custom' && customPlayer.loaded) {
    customPlayer.start(Tone.now());
  } else if (sound.id === 'tts') {
    const utterance = new SpeechSynthesisUtterance(ttsText || 'Timer complete');
    window.speechSynthesis.speak(utterance);
  } else if (sound.file && sound.file !== 'custom' && filePlayer.loaded && currentSoundFile === sound.file) {
    filePlayer.start(Tone.now());
  } else if (sound.id === 'none') {
    // Do nothing
  }
};

// --- Custom Hook for localStorage ---
function useLocalStorage(key, initialValue, consentGiven) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    if (!consentGiven) {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      const parsedItem = item ? JSON.parse(item) : initialValue;

      const mergedValue = {
        ...initialValue,
        ...parsedItem,
        timers: { ...initialValue.timers, ...(parsedItem.timers || {}) },
        clock: { ...initialValue.clock, ...(parsedItem.clock || {}) },
        theme: { ...initialValue.theme, ...(parsedItem.theme || {}) },
      };
      return mergedValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (consentGiven && typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (consentGiven && typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsedItem = JSON.parse(item);
          const mergedValue = {
            ...initialValue,
            ...parsedItem,
            timers: { ...initialValue.timers, ...(parsedItem.timers || {}) },
            clock: { ...initialValue.clock, ...(parsedItem.clock || {}) },
            theme: { ...initialValue.theme, ...(parsedItem.theme || {}) },
          };
          setStoredValue(mergedValue);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }, [consentGiven, key, initialValue]);

  return [storedValue, setValue];
}


// --- Clock Themes CSS ---
const ClockStyles = () => (
  <style>{`
    /* --- Digital Clock Themes (Base) --- */
    .digital-clock-base {
      text-align: center;
    }

    /* --- Analog Clock Themes (Shared Base) --- */
    .analog-clock-face {
      width: 15rem; /* 240px */
      height: 15rem; /* 240px */
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .analog-number {
      position: absolute;
      text-align: center;
    }
    .analog-center-dot {
      position: absolute;
      border-radius: 9999px;
      z-index: 10;
    }
    .analog-hour-hand, .analog-minute-hand, .analog-second-hand {
      position: absolute;
      border-top-left-radius: 9999px;
      border-top-right-radius: 9999px;
      transform-origin: bottom;
      bottom: 50%;
    }

    /* --- Theme 1: Classic (Default) --- */
    .classic {
      background-color: rgba(0, 0, 0, 0.2);
      border: 4px solid rgba(255, 255, 255, 0.5);
    }
    .classic .analog-number { font-size: 1.25rem; font-weight: 600; color: rgba(255, 255, 255, 0.7); }
    .classic .analog-center-dot { width: 0.75rem; height: 0.75rem; background-color: white; }
    .classic .analog-hour-hand { width: 0.375rem; height: 4rem; background-color: white; }
    .classic .analog-minute-hand { width: 0.25rem; height: 6rem; background-color: white; }
    .classic .analog-second-hand { width: 0.125rem; height: 7rem; background-color: #ef4444; }

    /* --- Theme 2: Modern --- */
    .modern {
      background-color: #f9fafb; /* gray-50 */
      border: 1px solid #d1d5db; /* gray-300 */
    }
    .modern .analog-number { font-size: 1.25rem; font-weight: 500; color: #1f2937; }
    .modern .analog-center-dot { width: 0.5rem; height: 0.5rem; background-color: #111827; }
    .modern .analog-hour-hand { width: 0.375rem; height: 3.5rem; background-color: #1f2937; }
    .modern .analog-minute-hand { width: 0.25rem; height: 5.5rem; background-color: #1f2937; }
    .modern .analog-second-hand { width: 0.125rem; height: 6.5rem; background-color: #ef4444; }

    /* --- Theme 3: Minimal --- */
    .minimal {
      background-color: white;
      border: 2px solid #111827;
    }
    .minimal .analog-number { display: none; } /* No numbers */
    .minimal .analog-center-dot { width: 0.375rem; height: 0.375rem; background-color: #111827; }
    .minimal .analog-hour-hand { width: 0.25rem; height: 4rem; background-color: #111827; }
    .minimal .analog-minute-hand { width: 0.125rem; height: 6rem; background-color: #111827; }
    .minimal .analog-second-hand { display: none; } /* No second hand */

    /* --- Theme 4: Ocean --- */
    .ocean {
      background-image: linear-gradient(to br, #0c4a6e, #0369a1);
      border: 2px solid #7dd3fc;
    }
    .ocean .analog-number { font-size: 1.25rem; font-weight: 600; color: #f0f9ff; }
    .ocean .analog-center-dot { width: 0.75rem; height: 0.75rem; background-color: white; }
    .ocean .analog-hour-hand { width: 0.375rem; height: 4rem; background-color: white; }
    .ocean .analog-minute-hand { width: 0.25rem; height: 6rem; background-color: white; }
    .ocean .analog-second-hand { width: 0.125rem; height: 7rem; background-color: #fcd34d; }

    /* --- Theme 5: Forest --- */
    .forest {
      background-color: #14532d; /* green-900 */
      border: 4px solid #4d7c0f; /* lime-700 */
    }
    .forest .analog-number { font-size: 1.25rem; font-weight: 600; color: #fefce8; }
    .forest .analog-center-dot { width: 0.75rem; height: 0.75rem; background-color: #a16207; }
    .forest .analog-hour-hand { width: 0.5rem; height: 3.5rem; background-color: #a16207; }
    .forest .analog-minute-hand { width: 0.375rem; height: 5.5rem; background-color: #a16207; }
    .forest .analog-second-hand { width: 0.125rem; height: 7rem; background-color: #facc15; }

    /* --- Theme 6: Neon --- */
    .neon {
      background-color: #000;
      border: 2px solid #0891b2;
      box-shadow: 0 0 10px #0891b2, 0 0 20px #0891b2;
    }
    .neon .analog-number { font-size: 1.25rem; font-weight: 700; color: #06b6d4; text-shadow: 0 0 5px #06b6d4; }
    .neon .analog-center-dot { width: 0.5rem; height: 0.5rem; background-color: #06b6d4; }
    .neon .analog-hour-hand { width: 0.375rem; height: 4rem; background-color: #06b6d4; box-shadow: 0 0 3px #06b6d4; }
    .neon .analog-minute-hand { width: 0.25rem; height: 6rem; background-color: #06b6d4; box-shadow: 0 0 3px #06b6d4; }
    .neon .analog-second-hand { width: 0.125rem; height: 7rem; background-color: #ec4899; box-shadow: 0 0 3px #ec4899; }

    /* --- Theme 7: Royal --- */
    .royal {
      background-color: #4c1d95; /* violet-900 */
      border: 2px solid #d97706; /* amber-600 */
    }
    .royal .analog-number { font-family: serif; font-size: 1.25rem; font-weight: 700; color: #f59e0b; }
    .royal .analog-center-dot { width: 0.625rem; height: 0.625rem; background-color: #f59e0b; }
    .royal .analog-hour-hand { width: 0.375rem; height: 4rem; background-color: #f59e0b; }
    .royal .analog-minute-hand { width: 0.25rem; height: 6rem; background-color: #f59e0b; }
    .royal .analog-second-hand { width: 0.125rem; height: 7rem; background-color: #fde047; }
    
    /* --- Theme 8: Crimson --- */
    .crimson {
      background-color: #991b1b; /* red-800 */
      border: 2px solid #dc2626; /* red-600 */
    }
    .crimson .analog-number { font-size: 1.25rem; font-weight: 600; color: #fef2f2; }
    .crimson .analog-center-dot { width: 0.75rem; height: 0.75rem; background-color: white; }
    .crimson .analog-hour-hand { width: 0.375rem; height: 4rem; background-color: white; }
    .crimson .analog-minute-hand { width: 0.25rem; height: 6rem; background-color: white; }
    .crimson .analog-second-hand { width: 0.125rem; height: 7rem; background-color: #fecaca; }

    /* --- Theme 9: Stealth --- */
    .stealth {
      background-color: #1f2937; /* gray-800 */
      border: 2px solid #374151; /* gray-700 */
    }
    .stealth .analog-number { font-size: 1.25rem; font-weight: 500; color: #6b7280; }
    .stealth .analog-center-dot { width: 0.5rem; height: 0.5rem; background-color: #4b5563; }
    .stealth .analog-hour-hand { width: 0.375rem; height: 4rem; background-color: #6b7280; }
    .stealth .analog-minute-hand { width: 0.25rem; height: 6rem; background-color: #6b7280; }
    .stealth .analog-second-hand { width: 0.125rem; height: 7rem; background-color: #9ca3af; }

    /* --- Theme 10: Simple --- */
    .simple {
      background-color: transparent;
      border: none;
    }
    .simple .analog-number { font-size: 1.25rem; font-weight: 600; color: white; }
    .simple .analog-center-dot { width: 0.75rem; height: 0.75rem; background-color: white; }
    .simple .analog-hour-hand { width: 0.375rem; height: 4rem; background-color: white; }
    .simple .analog-minute-hand { width: 0.25rem; height: 6rem; background-color: white; }
    .simple .analog-second-hand { width: 0.125rem; height: 7rem; background-color: #ef4444; }

    /* --- Preview Styles --- */
    .analog-preview-wrapper {
      width: 128px;
      height: 128px;
      margin: 1rem auto 0;
    }
    .analog-preview-wrapper .analog-clock-face {
      width: 100%;
      height: 100%;
      border-width: 2px;
    }
    .analog-preview-wrapper .analog-number {
      font-size: 0.75rem;
      font-weight: 600;
    }
    .analog-preview-wrapper .analog-center-dot {
      width: 0.5rem;
      height: 0.5rem;
    }
    .analog-preview-wrapper .analog-hour-hand {
      width: 0.25rem;
      height: 2.25rem;
    }
    .analog-preview-wrapper .analog-minute-hand {
      width: 0.125rem;
      height: 3.25rem;
    }
    .analog-preview-wrapper .analog-second-hand {
      width: 1px;
      height: 3.75rem;
    }
    .analog-preview-wrapper .minimal .analog-center-dot { width: 0.25rem; height: 0.25rem; }
    .analog-preview-wrapper .modern .analog-hour-hand { height: 2rem; }
    .analog-preview-wrapper .modern .analog-minute-hand { height: 3rem; }
    .analog-preview-wrapper .modern .analog-second-hand { height: 3.5rem; }
    .analog-preview-wrapper .forest .analog-hour-hand { width: 0.375rem; height: 2rem; }
    .analog-preview-wrapper .forest .analog-minute-hand { width: 0.25rem; height: 3rem; }
  `}</style>
);


// --- Main App Component ---
export default function App() {
  const [cookieConsent, setCookieConsent] = useLocalStorage('study_cookie_consent', false, true);
  const [activeTab, setActiveTab] = useState(TABS.POMODORO);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useLocalStorage('study_settings', DEFAULT_SETTINGS, cookieConsent);
  const [customSoundLoaded, setCustomSoundLoaded] = useState(false);

  useEffect(() => {
    alarmVolume.volume.value = settings.volume;
  }, [settings.volume]);

  useEffect(() => {
    const sound = ALL_SOUNDS_MAP.get(settings.sound);
    if (sound && sound.file && sound.file !== 'custom' && sound.file !== 'tts') {
      if (currentSoundFile !== sound.file) {
        filePlayer.load(sound.file).then(() => {
          currentSoundFile = sound.file;
        }).catch(e => {
          console.error(`Error loading sound: ${sound.file}`, e);
          currentSoundFile = null;
        });
      }
    } else {
      currentSoundFile = null;
    }
  }, [settings.sound]);

  useEffect(() => {
    if (settings.theme.auto) return;

    if (settings.theme.type === 'gradient') {
      document.body.className = `${settings.theme.value} transition-all duration-500`;
      document.body.style.backgroundImage = '';
    } else if (settings.theme.type === 'image') {
      document.body.className = 'transition-all duration-500';
      document.body.style.backgroundImage = `url(${settings.theme.value})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
    }
  }, [settings.theme.type, settings.theme.value, settings.theme.auto]);

  useEffect(() => {
    const applyAutoTheme = () => {
      const hour = dayjs().hour();
      let newThemeValue = TIME_BASED_THEMES.night;
      if (hour >= 5 && hour < 12) {
        newThemeValue = TIME_BASED_THEMES.morning;
      } else if (hour >= 12 && hour < 17) {
        newThemeValue = TIME_BASED_THEMES.afternoon;
      } else if (hour >= 17 && hour < 21) {
        newThemeValue = TIME_BASED_THEMES.evening;
      }
      document.body.className = `${newThemeValue} transition-all duration-500`;
      document.body.style.backgroundImage = '';
    };

    if (settings.theme.auto) {
      applyAutoTheme();
      const interval = setInterval(applyAutoTheme, 60000 * 5);
      return () => clearInterval(interval);
    }
  }, [settings.theme.auto]);

  const handleAcceptCookies = () => setCookieConsent(true);

  const updateSettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSoundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        customPlayer.load(loadEvent.target.result).then(() => {
          setCustomSoundLoaded(true);
          updateSettings('sound', 'custom');
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 relative font-poppins antialiased">
      <ClockStyles />

      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
        <h1 className="text-xl font-bold text-white/90">StudyWithMe</h1>
      </div>

      <div
        className="fixed inset-0 bg-black pointer-events-none transition-opacity duration-300 z-50"
        style={{ opacity: (100 - settings.theme.brightness) / 100 }}
      ></div>

      <motion.div
        className="w-full max-w-lg bg-black bg-opacity-30 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden z-10"
        layout
      >
        <header className="flex justify-around items-center p-2 bg-black bg-opacity-20">
          <TabButton
            icon={<IoTimerOutline size={22} />}
            label="Pomodoro"
            isActive={activeTab === TABS.POMODORO}
            onClick={() => setActiveTab(TABS.POMODORO)}
          />
          <TabButton
            icon={<FaRegClock size={20} />}
            label="Clock"
            isActive={activeTab === TABS.TIME}
            onClick={() => setActiveTab(TABS.TIME)}
          />
          <TabButton
            icon={<FaRegHourglass size={20} />}
            label="Timer"
            isActive={activeTab === TABS.TIMER}
            onClick={() => setActiveTab(TABS.TIMER)}
          />
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Open settings"
          >
            <Settings size={20} />
          </button>
        </header>

        <main className="p-6 sm:p-8 min-h-[300px]">
          <AnimatePresence mode="wait">
            {activeTab === TABS.POMODORO && (
              <PomodoroTimer
                key={TABS.POMODORO}
                settings={settings}
                onPlaySound={() => playSound(settings.sound, settings.ttsText)}
                themeClass={settings.clock.digitalTheme}  
              />
            )}
            {activeTab === TABS.TIME && (
              <TimeWidget
                key={TABS.TIME}
                clockSettings={settings.clock}
              />
            )}
            {activeTab === TABS.TIMER && (
              <TimerWidget
                key={TABS.TIMER}
                onPlaySound={() => playSound(settings.sound, settings.ttsText)}
                themeClass={settings.clock.digitalTheme}  
              />
            )}
          </AnimatePresence>
        </main>
      </motion.div>

      <footer className="absolute bottom-4 text-center text-xs text-white/50 z-10">
        Focus.
      </footer>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            onUpdate={updateSettings}
            onSoundUpload={handleSoundUpload}
            customSoundLoaded={customSoundLoaded}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!cookieConsent && (
          <CookieConsent onAccept={handleAcceptCookies} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Tab Components ---
function TabButton({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${
        isActive ? 'text-white' : 'text-gray-400 hover:text-white'
      }`}
    >
      {icon}
      <span className="text-xs font-medium mt-1">{label}</span>
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
          layoutId="activeTabIndicator"
        />
      )}
    </button>
  );
}

// --- Page/Widget Components ---
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// --- Task Input Modal ---
function TaskModal({ onStart }) {
  const [tasks, setTasks] = useState(['']);

  const updateTask = (index, value) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const addTask = () => {
    setTasks([...tasks, '']);
  };

  const removeTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    if (newTasks.length === 0) {
      setTasks(['']);
    } else {
      setTasks(newTasks);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validTasks = tasks.map(t => t.trim()).filter(t => t);
    if (validTasks.length > 0) {
      onStart(validTasks);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-center"
    >
      <form onSubmit={handleSubmit} className="w-full">
        <label className="block text-sm font-medium text-gray-300 mb-2">What are you working on?</label>
        <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={task}
                onChange={(e) => updateTask(index, e.target.value)}
                placeholder={`Task ${index + 1}`}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white/50"
                autoFocus={index === 0}
              />
              <button
                type="button"
                onClick={() => removeTask(index)}
                className="p-2 text-red-500 hover:text-red-400"
                aria-label="Remove task"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addTask}
          className="w-full mt-3 py-2 text-sm text-white/70 hover:text-white bg-white/10 rounded-lg"
        >
          + Add Task
        </button>

        <button
          type="submit"
          className="w-full h-12 mt-4 bg-white text-black rounded-full flex items-center justify-center text-lg font-semibold uppercase shadow-lg transform hover:scale-105 transition-transform"
        >
          Start
        </button>
      </form>
    </motion.div>
  );
}

// --- Pomodoro Timer ---
// UPDATED: Added themeClass
function PomodoroTimer({ settings, onPlaySound, themeClass }) {
  const [mode, setMode] = useState(POMO_MODES.POMODORO);
  const [timeLeft, setTimeLeft] = useState(settings.timers[mode] * 60);
  const [isActive, setIsActive] = useState(false);
  const [currentTasks, setCurrentTasks] = useState([]);
  const [currentQuote, setCurrentQuote] = useState("");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const intervalRef = useRef(null);

  const startTimerWithTask = (tasks) => {
    setCurrentTasks(tasks);
    const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setCurrentQuote(quote);

    setIsTaskModalOpen(false);
    setIsActive(true);
    Tone.start();
  };

  const startTimer = () => {
    if (!isActive && currentTasks.length === 0 && mode === POMO_MODES.POMODORO) {
      setIsTaskModalOpen(true);
    } else {
      setIsActive(true);
      Tone.start();
    }
  };

  const pauseTimer = () => setIsActive(false);

  const resetTimer = () => {
    setIsActive(false);
    setCurrentTasks([]);
    setCurrentQuote("");
    setIsTaskModalOpen(false);
    setTimeLeft(settings.timers[mode] * 60);
  };

  const switchMode = (newMode) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(settings.timers[newMode] * 60);
  };

  // Timer logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            onPlaySound();

            const nextMode = mode === POMO_MODES.POMODORO ? POMO_MODES.SHORT : POMO_MODES.POMODORO;
            switchMode(nextMode);
            if (mode === POMO_MODES.POMODORO) {
              setCurrentTasks([]);
              setCurrentQuote("");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, onPlaySound, mode]);

  // Update time if settings change
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(settings.timers[mode] * 60);
    }
  }, [settings.timers, mode, isActive]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (isTaskModalOpen) {
    return <TaskModal onStart={startTimerWithTask} />;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-center"
    >
      <div className="flex space-x-2 mb-6 p-1 bg-black/20 rounded-full">
        <PomoTab label="Pomodoro" isActive={mode === POMO_MODES.POMODORO} onClick={() => switchMode(POMO_MODES.POMODORO)} />
        <PomoTab label="Short Break" isActive={mode === POMO_MODES.SHORT} onClick={() => switchMode(POMO_MODES.SHORT)} />
        <PomoTab label="Long Break" isActive={mode === POMO_MODES.LONG} onClick={() => switchMode(POMO_MODES.LONG)} />
      </div>

      {/* UPDATED: Applied themeClass */}
      <div className={`text-7xl sm:text-8xl md:text-9xl digital-clock-base mb-2 ${themeClass}`}>
        {formatTime(timeLeft)}
      </div>

      <div className="h-6 mb-2 text-base text-white/80 font-medium truncate w-full text-center px-4">
        {isActive && currentTasks.length > 0
          ? currentTasks.join(', ')
          : (mode !== POMO_MODES.POMODORO ? 'Time for a break' : ' ')}
      </div>

      <div className="h-5 mb-3 text-sm text-white/60 italic text-center truncate w-full px-4">
        {isActive && currentQuote ? `"${currentQuote}"` : ' '}
      </div>

      <div className="flex items-center space-x-4">
        <button onClick={resetTimer} className="p-4 text-white/50 hover:text-white transition-colors" aria-label="Reset timer">
          <RefreshCw size={24} />
        </button>
        <button
          onClick={isActive ? pauseTimer : startTimer}
          className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center text-2xl font-semibold uppercase shadow-lg transform hover:scale-105 transition-transform"
          aria-label={isActive ? 'Pause timer' : 'Start timer'}
        >
          {isActive ? <Pause size={32} /> : <Play size={32} />}
        </button>
        <div className="w-[56px]"></div>
      </div>
    </motion.div>
  );
}

function PomoTab({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-semibold rounded-full ${
        isActive ? 'text-black' : 'text-white/70 hover:text-white'
      }`}
    >
      {label}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-white rounded-full -z-10"
          layoutId="pomoTabIndicator"
        />
      )}
    </button>
  );
}

// --- Time Widget ---
function TimeWidget({ clockSettings }) {
  const [time, setTime] = useState(dayjs());

  useEffect(() => {
    const intervalId = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const timeInZone = time.tz(clockSettings.timezone);

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-center justify-center"
    >
      {clockSettings.type === 'digital' ? (
        <DigitalClock
          time={timeInZone}
          format={clockSettings.format}
          themeClass={clockSettings.digitalTheme}
        />
      ) : (
        <AnalogClock
          time={timeInZone}
          themeClass={clockSettings.analogTheme}
        />
      )}
      <div className="mt-6 text-lg text-white/70">
        {timeInZone.format('dddd, MMMM D')}
      </div>
      <div className="mt-2 text-sm text-white/50">
        {clockSettings.timezone.replace('_', ' ')}
      </div>
    </motion.div>
  );
}

// UPDATED: Corrected DigitalClock component
function DigitalClock({ time, format, themeClass }) {
  const timeFormat = format === '12h' ? 'hh:mm:ss A' : 'HH:mm:ss';
  return (
    <div className={`text-6xl sm:text-7xl md:text-8xl digital-clock-base ${themeClass}`}>
      {time.format(timeFormat)}
    </div>
  );
}

// UPDATED: Corrected AnalogClock component
function AnalogClock({ time, themeClass }) {
  const seconds = time.second();
  const minutes = time.minute();
  const hours = time.hour();

  const secondHandRotation = seconds * 6;
  const minuteHandRotation = minutes * 6 + seconds * 0.1;
  const hourHandRotation = (hours % 12) * 30 + minutes * 0.5;

  return (
    <div className={`relative w-60 h-60 rounded-full flex items-center justify-center analog-clock-face ${themeClass}`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-full h-full"
          style={{ transform: `rotate(${ (i + 1) * 30 }deg)` }}
        >
          <span
            className="absolute analog-number"
            style={{ top: '10px', left: '50%', transform: `translateX(-50%) rotate(${ -(i + 1) * 30 }deg)` }}
          >
            {i + 1}
          </span>
        </div>
      ))}
      <div className="absolute rounded-full z-10 analog-center-dot"></div>
      <div className="absolute rounded-t-full analog-hour-hand" style={{ transform: `rotate(${hourHandRotation}deg)` }}></div>
      <div className="absolute rounded-t-full analog-minute-hand" style={{ transform: `rotate(${minuteHandRotation}deg)` }}></div>
      <div className="absolute rounded-t-full analog-second-hand" style={{ transform: `rotate(${secondHandRotation}deg)` }}></div>
    </div>
  );
}

// --- AnalogClockPreview Component ---
function AnalogClockPreview({ themeClass }) {
  // Static time for preview: 10:10:30
  const secondHandRotation = 180; // 30s * 6
  const minuteHandRotation = 63; // 10m * 6 + 30s * 0.1
  const hourHandRotation = 305; // 10h * 30 + 10m * 0.5

  return (
    <div className="analog-preview-wrapper">
      <div className={`relative w-full h-full rounded-full flex items-center justify-center analog-clock-face ${themeClass}`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-full"
            style={{ transform: `rotate(${ (i + 1) * 30 }deg)` }}
          >
            <span
              className="absolute analog-number"
              style={{ top: '6px', left: '50%', transform: `translateX(-50%) rotate(${ -(i + 1) * 30 }deg)` }}
            >
              {i + 1}
            </span>
          </div>
        ))}
        <div className="absolute rounded-full z-10 analog-center-dot"></div>
        <div className="absolute rounded-t-full analog-hour-hand" style={{ transform: `rotate(${hourHandRotation}deg)` }}></div>
        <div className="absolute rounded-t-full analog-minute-hand" style={{ transform: `rotate(${minuteHandRotation}deg)` }}></div>
        <div className="absolute rounded-t-full analog-second-hand" style={{ transform: `rotate(${secondHandRotation}deg)` }}></div>
      </div>
    </div>
  );
}


// --- Timer Widget (Stopwatch/Countdown) ---
// UPDATED: Added themeClass
function TimerWidget({ onPlaySound, themeClass }) {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('stopwatch');
  const [initialTime, setInitialTime] = useState(0);
  const [minutesInput, setMinutesInput] = useState('0');
  const [secondsInput, setSecondsInput] = useState('0');

  const intervalRef = useRef(null);
  const endTimeRef = useRef(0);

  useEffect(() => {
    if (isActive) {
      if (mode === 'stopwatch') {
        const startTime = Date.now() - time;
        intervalRef.current = setInterval(() => setTime(Date.now() - startTime), 10);
      } else if (mode === 'countdown') {
        endTimeRef.current = Date.now() + time;
        intervalRef.current = setInterval(() => {
          const newTime = endTimeRef.current - Date.now();
          if (newTime <= 0) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            setTime(0);
            onPlaySound();
            setMode('stopwatch');
          } else {
            setTime(newTime);
          }
        }, 10);
      }
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, mode, onPlaySound]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTime(mode === 'countdown' ? initialTime : 0);
  };

  const handleSetTimer = (e) => {
    e.preventDefault();
    const mins = parseInt(minutesInput, 10) || 0;
    const secs = parseInt(secondsInput, 10) || 0;
    const totalMs = (mins * 60 + secs) * 1000;

    setIsActive(false);
    if (totalMs > 0) {
      setMode('countdown');
      setInitialTime(totalMs);
      setTime(totalMs);
    } else {
      setMode('stopwatch');
      setInitialTime(0);
      setTime(0);
    }
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-center justify-center"
    >
      <form onSubmit={handleSetTimer} className="flex items-center space-x-2 mb-6">
        <input type="number" min="0" value={minutesInput} onChange={e => setMinutesInput(e.target.value)} className="w-20 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-center" placeholder="Min" />
        <span className="text-xl">:</span>
        <input type="number" min="0" max="59" value={secondsInput} onChange={e => setSecondsInput(e.target.value)} className="w-20 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-center" placeholder="Sec" />
        <button type="submit" className="px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold hover:bg-white/30">Set</button>
      </form>
      
      {/* UPDATED: Applied themeClass */}
      <div className={`text-5xl sm:text-6xl md:text-7xl digital-clock-base mb-8 ${themeClass}`}>
        {formatTime(time)}
      </div>

      <div className="flex items-center space-x-4">
        <button onClick={resetTimer} className="p-4 text-white/50 hover:text-white transition-colors" aria-label="Reset timer">
          <RefreshCw size={24} />
        </button>
        <button
          onClick={toggleTimer}
          className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center text-2xl font-semibold uppercase shadow-lg transform hover:scale-105 transition-transform"
          aria-label={isActive ? 'Pause timer' : 'Start timer'}
        >
          {isActive ? <Pause size={32} /> : <Play size={32} />}
        </button>
        <div className="w-[56px]"></div>
      </div>
    </motion.div>
  );
}

// --- Settings Modal Components ---
function SettingsModal({ onClose, settings, onUpdate, onSoundUpload, customSoundLoaded }) {
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [timezoneSearch, setTimezoneSearch] = useState('');

  const modalContent = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  };

  // --- Setting Update Handlers ---
  const updateTimer = (mode, value) => {
    onUpdate('timers', { ...settings.timers, [mode]: parseInt(value, 10) || 0 });
  };
  const updateSound = (e) => onUpdate('sound', e.target.value);
  const updateVolume = (e) => onUpdate('volume', parseFloat(e.target.value));

  const updateClockType = (type) => onUpdate('clock', { ...settings.clock, type });
  const updateClockFormat = (format) => onUpdate('clock', { ...settings.clock, format });
  const updateTimezone = (e) => onUpdate('clock', { ...settings.clock, timezone: e.target.value });

  const updateDigitalTheme = (e) => {
    onUpdate('clock', { ...settings.clock, digitalTheme: e.target.value });
  };
  const updateAnalogTheme = (e) => {
    onUpdate('clock', { ...settings.clock, analogTheme: e.target.value });
  };

  const updateTheme = (theme) => {
    onUpdate('theme', { ...settings.theme, type: 'gradient', value: theme.value, auto: false });
  };
  const updateAutoTheme = (e) => {
    onUpdate('theme', { ...settings.theme, auto: e.target.checked });
  };
  const updateBrightness = (e) => {
    onUpdate('theme', { ...settings.theme, brightness: parseFloat(e.target.value) });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        onUpdate('theme', { ...settings.theme, type: 'image', value: loadEvent.target.result, auto: false });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredTimezones = useMemo(() => {
    if (!timezoneSearch) {
      return TIMEZONES;
    }
    const lowerSearch = timezoneSearch.toLowerCase().replace('_', ' ');
    return TIMEZONES.filter(tz =>
      tz.toLowerCase().replace('_', ' ').includes(lowerSearch)
    );
  }, [timezoneSearch]);

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-3xl h-[80vh] bg-gray-900 rounded-lg shadow-2xl flex flex-col md:flex-row overflow-hidden"
        variants={modalContent}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Nav */}
        <nav className="w-full md:w-1/3 lg:w-1/4 bg-gray-800 p-4 space-y-2 flex-shrink-0 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 px-2">Settings</h2>
          <SettingsTab label="General" icon={<IoColorPaletteOutline />} isActive={activeSettingsTab === 'general'} onClick={() => setActiveSettingsTab('general')} />
          <SettingsTab label="Timers" icon={<IoTimerOutline />} isActive={activeSettingsTab === 'timers'} onClick={() => setActiveSettingsTab('timers')} />
          <SettingsTab label="Sound" icon={<IoMusicalNotesOutline />} isActive={activeSettingsTab === 'sound'} onClick={() => setActiveSettingsTab('sound')} />
          <SettingsTab label="Clock" icon={<FaRegClock />} isActive={activeSettingsTab === 'clock'} onClick={() => setActiveSettingsTab('clock')} />
        </nav>

        {/* Right Content */}
        <div className="w-full md:w-2/3 lg:w-3/4 p-6 md:p-8 overflow-y-auto relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white" aria-label="Close settings">
            <X size={24} />
          </button>

          <AnimatePresence mode="wait">
            {activeSettingsTab === 'general' && (
              <SettingsContent key="general">
                <h3 className="text-2xl font-semibold mb-6">General</h3>

                <div className="flex items-center justify-between mb-6 p-4 bg-gray-800 rounded-lg">
                  <label htmlFor="auto-theme" className="text-sm font-medium text-gray-300">Auto Time-of-Day Theme</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="auto-theme" className="sr-only peer"
                      checked={settings.theme.auto}
                      onChange={updateAutoTheme}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <label className={`block text-sm font-medium mb-2 ${settings.theme.auto ? 'text-gray-500' : 'text-gray-300'}`}>
                  Manual Theme {settings.theme.auto && "(Disabled by Auto-Theme)"}
                </label>
                <fieldset disabled={settings.theme.auto}>
                  <div className={`grid grid-cols-2 gap-4 mb-6 ${settings.theme.auto ? 'opacity-50' : ''}`}>
                    {THEMES.map(theme => (
                      <button
                        key={theme.name}
                        onClick={() => updateTheme(theme)}
                        className="h-20 rounded-lg relative overflow-hidden ring-2 ring-transparent hover:ring-white disabled:hover:ring-transparent"
                      >
                        <div className={`absolute inset-0 ${theme.value}`}></div>
                        <span className="absolute bottom-2 left-2 text-sm font-semibold">{theme.name}</span>
                        {settings.theme.value === theme.value && !settings.theme.auto && (
                          <CheckCircle className="absolute top-2 right-2 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                  <label
                    htmlFor="custom-theme-upload"
                    className={`w-full h-20 bg-gray-800 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-600 mb-6 ${settings.theme.auto ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700 cursor-pointer'}`}
                  >
                    <ImageIcon className="text-gray-400 mb-1" />
                    <span className="text-sm text-gray-400">Upload Custom Image</span>
                  </label>
                  <input id="custom-theme-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={settings.theme.auto} />
                </fieldset>

                <label className="block text-sm font-medium text-gray-300 mb-2">Overall Brightness</label>
                <div className="flex items-center space-x-4">
                  <Moon size={18} className="text-gray-400" />
                  <input type="range" min="20" max="100" step="1" value={settings.theme.brightness} onChange={updateBrightness} className="w-full" />
                  <Sun size={20} className="text-gray-400" />
                </div>
              </SettingsContent>
            )}

            {activeSettingsTab === 'timers' && (
              <SettingsContent key="timers">
                <h3 className="text-2xl font-semibold mb-6">Timers (minutes)</h3>
                <SettingsInput label="Pomodoro" type="number" min="1" value={settings.timers.pomodoro} onChange={e => updateTimer(POMO_MODES.POMODORO, e.target.value)} />
                <SettingsInput label="Short Break" type="number" min="1" value={settings.timers.shortBreak} onChange={e => updateTimer(POMO_MODES.SHORT, e.target.value)} />
                <SettingsInput label="Long Break" type="number" min="1" value={settings.timers.longBreak} onChange={e => updateTimer(POMO_MODES.LONG, e.target.value)} />
              </SettingsContent>
            )}

            {activeSettingsTab === 'sound' && (
              <SettingsContent key="sound">
                <h3 className="text-2xl font-semibold mb-6">Sound</h3>
                <SettingsSelect label="Alert Sound" value={settings.sound} onChange={updateSound}>
                  {SOUNDS.map(group => (
                    <optgroup key={group.category} label={group.category}>
                      {group.options.map(opt => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                          {opt.id === 'custom' && customSoundLoaded && ' (Loaded)'}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </SettingsSelect>

                <AnimatePresence>
                  {settings.sound === 'tts' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SettingsInput
                        label="Text to Speak"
                        type="text"
                        placeholder="e.g., Time's up, John!"
                        value={settings.ttsText}
                        onChange={e => onUpdate('ttsText', e.target.value)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <label
                  htmlFor="custom-sound-upload"
                  className="w-full mt-4 h-20 bg-gray-800 hover:bg-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-600"
                >
                  <Upload className="text-gray-400 mb-1" />
                  <span className="text-sm text-gray-400">Upload Custom Sound (.mp3, .wav)</span>
                </label>
                <input id="custom-sound-upload" type="file" accept="audio/*" className="hidden" onChange={onSoundUpload} />
                <p className="text-xs text-gray-500 mt-2">Custom sounds are not saved after refresh.</p>
                <label className="block text-sm font-medium text-gray-300 mb-2 mt-6">Alert Volume (Above 0dB may distort)</label>
                <input
                  type="range"
                  min="-40"
                  max="6"
                  step="1"
                  value={settings.volume}
                  onInput={updateVolume}
                  onChange={() => playSound(settings.sound, settings.ttsText)}
                  className="w-full"
                />
              </SettingsContent>
            )}

            {activeSettingsTab === 'clock' && (
              <SettingsContent key="clock">
                <h3 className="text-2xl font-semibold mb-6">Clock</h3>
                {/* Clock Type */}
                <label className="block text-sm font-medium text-gray-300 mb-2">Clock Type</label>
                <div className="flex space-x-2 mb-6">
                  <button onClick={() => updateClockType('digital')} className={`px-4 py-2 rounded-lg ${settings.clock.type === 'digital' ? 'bg-white text-black' : 'bg-gray-700'}`}>Digital</button>
                  <button onClick={() => updateClockType('analog')} className={`px-4 py-2 rounded-lg ${settings.clock.type === 'analog' ? 'bg-white text-black' : 'bg-gray-700'}`}>Analog</button>
                </div>
                {/* Clock Format (12/24) */}
                <label className="block text-sm font-medium text-gray-300 mb-2">Clock Format</label>
                <div className="flex space-x-2 mb-6">
                  <button onClick={() => updateClockFormat('12h')} className={`px-4 py-2 rounded-lg ${settings.clock.format === '12h' ? 'bg-white text-black' : 'bg-gray-700'}`}>12 Hour</button>
                  <button onClick={() => updateClockFormat('24h')} className={`px-4 py-2 rounded-lg ${settings.clock.format === '24h' ? 'bg-white text-black' : 'bg-gray-700'}`}>24 Hour</button>
                </div>

                {/* --- UPDATED CLOCK THEMES with Previews --- */}
                <SettingsSelect
                  label="Digital Clock Theme (Applies to all timers)"
                  value={settings.clock.digitalTheme}
                  onChange={updateDigitalTheme}
                >
                  {DIGITAL_CLOCK_THEMES.map(theme => (
                    <option key={theme.id} value={theme.value}>{theme.name}</option>
                  ))}
                </SettingsSelect>
                
                {/* Digital Preview */}
                <AnimatePresence>
                  <motion.div
                    key={settings.clock.digitalTheme} // Re-renders on change
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gray-800 rounded-lg mt-2 flex justify-center items-center"
                  >
                    <div className={`text-4xl digital-clock-base ${settings.clock.digitalTheme}`}>
                      12:34:56
                    </div>
                  </motion.div>
                </AnimatePresence>


                <SettingsSelect
                  label="Analog Clock Theme"
                  value={settings.clock.analogTheme}
                  onChange={updateAnalogTheme}
                  className="mt-6"
                >
                  {ANALOG_CLOCK_THEMES.map(theme => (
                    <option key={theme.id} value={theme.id}>{theme.name}</option>
                  ))}
                </SettingsSelect>

                {/* Analog Preview */}
                <AnimatePresence>
                   <motion.div
                    key={settings.clock.analogTheme} // Re-renders on change
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gray-800 rounded-lg mt-2 flex justify-center items-center"
                  >
                    <AnalogClockPreview themeClass={settings.clock.analogTheme} />
                  </motion.div>
                </AnimatePresence>
                {/* --- END UPDATED CLOCK THEMES --- */}

                <hr className="border-gray-700 my-6" />

                <SettingsInput
                  label="Search Timezone"
                  type="text"
                  placeholder="e.g., New York, London, Kolkata"
                  value={timezoneSearch}
                  onChange={e => setTimezoneSearch(e.target.value)}
                />
                <SettingsSelect
                  label={filteredTimezones.length === 0 ? "No match found" : "Select Timezone"}
                  value={settings.clock.timezone}
                  onChange={updateTimezone}
                  disabled={filteredTimezones.length === 0}
                >
                  {filteredTimezones.map(tz => (
                    <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
                  ))}
                </SettingsSelect>
              </SettingsContent>
            )}
            
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SettingsTab({ label, icon, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 p-2 rounded-lg ${
        isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {React.cloneElement(icon, { size: 20 })}
      <span className="font-medium">{label}</span>
    </button>
  );
}

const settingsContentVariants = {
  hidden: { opacity: 0, x: 10 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

function SettingsContent({ children }) {
  return (
    <motion.div
      variants={settingsContentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function SettingsInput({ label, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <input
        {...props}
        className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white/50"
      />
    </div>
  );
}

function SettingsSelect({ label, children, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <select
        {...props}
        className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        {children}
      </select>
    </div>
  );
}

// --- Cookie Consent ---
function CookieConsent({ onAccept }) {
  return (
    <motion.div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:max-w-md p-6 bg-gray-800 rounded-lg shadow-2xl z-50"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
    >
      <div className="flex items-start">
        <AlertCircle className="text-blue-400 mr-4 flex-shrink-0" size={24} />
        <div>
          <h3 className="text-lg font-semibold">We use local storage</h3>
          <p className="text-sm text-gray-300 mt-2">
            This app uses local storage to save your settings (like themes, timers,
            and sounds) directly in your browser. No data is sent to us.
            By clicking "Accept", you agree to this.
          </p>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={onAccept}
          className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          Accept
        </button>
      </div>
    </motion.div>
  );
}