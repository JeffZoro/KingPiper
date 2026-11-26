/**
 * App state, kept only on this device (AsyncStorage). Piper has no accounts
 * and no server-side database: nothing about the user leaves the phone except
 * the words they ask it to translate.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { Translation } from './api';
import type { VoiceGender } from './voices';

export type Turn = Translation & { id: string; at: number; spoken: 'me' | 'them' };

export type Consent = {
  /** Accepted the Terms of Use and Privacy Policy. */
  terms: boolean;
  /** Passed the neutral age check: 13 or older (COPPA). */
  age13: boolean;
  birthYear: number;
  /** Understood they need consent from the people they record. */
  recording: boolean;
  /** Policy version they accepted, so we can re-ask after changes. */
  version: string;
  at: number;
};

export type State = {
  mine: string;
  theirs: string;
  gender: VoiceGender;
  autoSpeak: boolean;
  speechRate: number;
  premiumVoice: boolean;
  saveHistory: boolean;
  history: Turn[];
  saved: Turn[];
  consent: Consent | null;
  /** Set when the age check finds the person is under 13. Survives "erase". */
  ageBlocked: boolean;
  learn: {
    course: string;
    xp: number;
    streak: number;
    lastDay: string | null;
    completed: string[];
    dailyGoal: number;
    todayXp: number;
    knownWords: string[];
  };
};

export const POLICY_VERSION = '2026-11-26';

const DEFAULTS: State = {
  mine: 'en',
  theirs: 'es',
  gender: 'female',
  autoSpeak: true,
  speechRate: 1,
  premiumVoice: true,
  saveHistory: true,
  history: [],
  saved: [],
  consent: null,
  ageBlocked: false,
  learn: {
    course: 'es',
    xp: 0,
    streak: 0,
    lastDay: null,
    completed: [],
    dailyGoal: 30,
    todayXp: 0,
    knownWords: [],
  },
};

const KEY = 'piper.state.v1';
const MAX_HISTORY = 50;

type Ctx = {
  state: State;
  ready: boolean;
  update: (patch: Partial<State> | ((s: State) => Partial<State>)) => void;
  addTurn: (t: Turn) => void;
  toggleSaved: (t: Turn) => void;
  awardXp: (amount: number, lessonId?: string) => void;
  /** Erase everything Piper stores on this device. */
  eraseAll: () => Promise<void>;
};

const StoreContext = createContext<Ctx | null>(null);

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function yesterday() {
  const d = new Date(Date.now() - 86_400_000);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<State>;
          setState({ ...DEFAULTS, ...saved, learn: { ...DEFAULTS.learn, ...saved.learn } });
        }
      } catch {
        // Corrupt or unavailable storage: start fresh.
      }
      loaded.current = true;
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const update = useCallback<Ctx['update']>((patch) => {
    setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));
  }, []);

  const addTurn = useCallback((t: Turn) => {
    setState((s) => (s.saveHistory ? { ...s, history: [t, ...s.history].slice(0, MAX_HISTORY) } : s));
  }, []);

  const toggleSaved = useCallback((t: Turn) => {
    setState((s) => {
      const exists = s.saved.some((x) => x.id === t.id);
      return { ...s, saved: exists ? s.saved.filter((x) => x.id !== t.id) : [t, ...s.saved] };
    });
  }, []);

  const awardXp = useCallback((amount: number, lessonId?: string) => {
    setState((s) => {
      const t = today();
      const l = s.learn;
      const isNewDay = l.lastDay !== t;
      const streak = isNewDay ? (l.lastDay === yesterday() ? l.streak + 1 : 1) : l.streak;
      return {
        ...s,
        learn: {
          ...l,
          xp: l.xp + amount,
          todayXp: (isNewDay ? 0 : l.todayXp) + amount,
          streak,
          lastDay: t,
          completed: lessonId && !l.completed.includes(lessonId) ? [...l.completed, lessonId] : l.completed,
        },
      };
    });
  }, []);

  const eraseAll = useCallback(async () => {
    await AsyncStorage.removeItem(KEY).catch(() => {});
    // Keep the under-13 block so the age check can't be bypassed by erasing.
    setState((s) => ({ ...DEFAULTS, ageBlocked: s.ageBlocked }));
  }, []);

  const value = useMemo(
    () => ({ state, ready, update, addTurn, toggleSaved, awardXp, eraseAll }),
    [state, ready, update, addTurn, toggleSaved, awardXp, eraseAll],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

/** Today's XP, reset if the last activity was on an earlier day. */
export function todayXp(s: State) {
  return s.learn.lastDay === today() ? s.learn.todayXp : 0;
}
/** Current streak, which lapses if a full day was missed. */
export function liveStreak(s: State) {
  const d = s.learn.lastDay;
  return d === today() || d === yesterday() ? s.learn.streak : 0;
}
