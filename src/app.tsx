import { useState, useEffect, useRef } from "react";
import JAPANESE_PRONOUNCES, { Kana, PronounceKey } from "./constant/japanese-pronounces";
import Settings from "./icon/settings";
import Sidebar, { syllableGroups } from "./components/sidebar";
import type { SettingsType } from "./components/sidebar";

const LOCAL_STORAGE_KEY = "japanese_randomizer_settings";

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [romaji, setRomaji] = useState<PronounceKey | null>(null);
  const [kana, setKana] = useState<Kana | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const [initialized, setInitialized] = useState(false);

  const [settings, setSettings] = useState<SettingsType>({
    delay: 2,
    selectedSyllables: {
      aiueo: true,
      kakikukeko: true,
      sashisuseso: true,
      tachitsuteto: true,
      naninuneno: true,
      hahifuheho: true,
      mamimumemo: true,
      yayuyo: true,
      rarirurero: true,
      wawon: true,
    },
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  }, [settings, initialized]);

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  const updateSettings = (newSettings: Partial<SettingsType>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const getRandomPronounce = () => {
    const enabledGroups = Object.entries(settings.selectedSyllables)
      .filter(([_, isEnabled]) => isEnabled)
      .map(([key]) => key);

    if (enabledGroups.length === 0) return;

    const availableKeys = enabledGroups.flatMap((group) => syllableGroups[group].split("/"));
    const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];

    setRomaji(randomKey as PronounceKey);
    setKana(null);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setKana(JAPANESE_PRONOUNCES[randomKey as PronounceKey]);
    }, settings.delay * 1000);
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.key === "Enter" || event.key === " ") && !sidebarOpen) {
        getRandomPronounce();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [settings, sidebarOpen]);

  return (
    <>
      <Sidebar
        open={sidebarOpen}
        close={closeSidebar}
        settings={settings}
        updateSettings={updateSettings}
      />
      <button
        onClick={openSidebar}
        className="z-30 cursor-pointer bg-gray-200 absolute top-4 left-4 md:top-12 md:left-12 text-gray-600 p-1.5 rounded border border-gray-300 shadow-md"
      >
        <Settings />
      </button>
      <div
        className="flex flex-col items-center justify-center min-h-screen"
        onClick={getRandomPronounce}
      >
        <div className="absolute top-6 md:top-12 max-md:pl-8">Press Enter/Space/Click Anywhere</div>
        <div className="responsive-text responsive-mb">{romaji}</div>
        {kana ? (
          <div className="responsive-text font-bold">
            <span className="text-blue-500 responsive-text-gap">{kana.h}</span>
            <span className="text-red-500">{kana.k}</span>
          </div>
        ) : (
          romaji && <div className="responsive-text font-bold text-gray-400">...</div>
        )}
      </div>
    </>
  );
};

export default App;
