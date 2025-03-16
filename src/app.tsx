import { useState, useEffect, useRef } from "react";
import JAPANESE_PRONOUNCES, { Kana, PronounceKey } from "@/constant/japanese-pronounces";
import Settings from "@/icon/settings";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LOCAL_STORAGE_KEY = "japanese_randomizer_settings";

const syllableGroups: Record<string, string> = {
  aiueo: "a/i/u/e/o",
  kakikukeko: "ka/ki/ku/ke/ko",
  sashisuseso: "sa/shi/su/se/so",
  tachitsuteto: "ta/chi/tsu/te/to",
  naninuneno: "na/ni/nu/ne/no",
  hahifuheho: "ha/hi/fu/he/ho",
  mamimumemo: "ma/mi/mu/me/mo",
  yayuyo: "ya/yu/yo",
  rarirurero: "ra/ri/ru/re/ro",
  wawon: "wa/wo/n",
};

export const voicedSyllableGroups: Record<string, string> = {
  gagigugego: "ga/gi/gu/ge/go",
  zazizuzezo: "za/ji/zu/ze/zo",
  dadidudedo: "da/di/du/de/do",
  babibubebo: "ba/bi/bu/be/bo",
  papipupepo: "pa/pi/pu/pe/po",
};

type SettingsType = {
  delay: number;
  selectedSyllables: Record<string, boolean>;
  selectedVoicedSyllables: Record<string, boolean>;
  kanaVariant: "hiragana" | "katakana" | "both";
};

const defaultSettings: SettingsType = {
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
  selectedVoicedSyllables: {
    gagigugego: false,
    zazizuzezo: false,
    dadidudedo: false,
    babibubebo: false,
    papipupepo: false,
  },
  kanaVariant: "both",
};

type Mode = "romanjiToKana" | "kanaToRomanji";

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [romaji, setRomaji] = useState<PronounceKey | null>(null);
  const [kana, setKana] = useState<Kana | null>(null);
  const [mode, setMode] = useState<Mode>("romanjiToKana");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [settings, setSettings] = useState<SettingsType>(defaultSettings);
  const lastPronounceRef = useRef<string | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed: Partial<SettingsType> = JSON.parse(savedSettings);
        setSettings((prev) => ({
          ...prev,
          ...parsed,
          selectedSyllables: {
            ...prev.selectedSyllables,
            ...parsed.selectedSyllables,
          },
          selectedVoicedSyllables: {
            ...prev.selectedVoicedSyllables,
            ...parsed.selectedVoicedSyllables,
          },
        }));
      } catch {
        setSettings(defaultSettings);
      }
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  }, [settings, initialized]);

  const updateSettings = (newSettings: Partial<SettingsType>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const getRandomPronounce = () => {
    const enabledUnvoiced = Object.entries(settings.selectedSyllables)
      .filter(([_, isEnabled]) => isEnabled)
      .map(([key]) => key);

    const enabledVoiced = Object.entries(settings.selectedVoicedSyllables)
      .filter(([_, isEnabled]) => isEnabled)
      .map(([key]) => key);

    const allEnabledGroups = [...enabledUnvoiced, ...enabledVoiced];
    if (allEnabledGroups.length === 0) return;

    const availableKeys = allEnabledGroups.flatMap((group) => {
      if (syllableGroups[group]) {
        return syllableGroups[group].split("/");
      } else if (voicedSyllableGroups[group]) {
        return voicedSyllableGroups[group].split("/");
      }
      return [];
    });

    if (availableKeys.length === 0) return;

    let randomKey: string;

    if (availableKeys.length === 1) {
      randomKey = availableKeys[0];
    } else {
      let attempts = 0;
      do {
        randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
        attempts++;
        if (attempts > 100) break;
      } while (randomKey === lastPronounceRef.current);
    }

    lastPronounceRef.current = randomKey;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (mode === "romanjiToKana") {
      setRomaji(randomKey as PronounceKey);
      setKana(null);
      timeoutRef.current = setTimeout(() => {
        setKana(JAPANESE_PRONOUNCES[randomKey as PronounceKey]);
      }, settings.delay * 1000);
    } else {
      setKana(JAPANESE_PRONOUNCES[randomKey as PronounceKey]);
      setRomaji(null);
      timeoutRef.current = setTimeout(() => {
        setRomaji(randomKey as PronounceKey);
      }, settings.delay * 1000);
    }
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
    };
  }, [settings, sidebarOpen, mode]);

  const areAllSelected = (obj: Record<string, boolean>) =>
    Object.values(obj).every((val) => val === true);

  return (
    <>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <button className="z-50 cursor-pointer bg-gray-200 absolute max-md:bottom-4 left-4 md:top-8 md:left-8 [@media(max-height:425px)]:top-4 text-gray-600 p-1.5 rounded border border-gray-300 shadow-md duration-200">
            <Settings />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[280px] md:w-[320px] flex flex-col h-full px-1 md:px-2"
        >
          <SheetHeader className="border-b pb-2 mx-2">
            <SheetTitle className="font-medium">Settings</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 px-1">
            <div className="space-y-4 mx-2">
              <div>
                <Label htmlFor="delay">Delay (s)</Label>
                <Input
                  id="delay"
                  type="number"
                  min="0"
                  value={settings.delay}
                  onChange={(e) => updateSettings({ delay: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="kanaVariant">Kana Variant</Label>
                <Select
                  value={settings.kanaVariant}
                  onValueChange={(value) =>
                    updateSettings({ kanaVariant: value as SettingsType["kanaVariant"] })
                  }
                >
                  <SelectTrigger id="kanaVariant" className="mt-1 w-full">
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both</SelectItem>
                    <SelectItem value="hiragana">Hiragana Only</SelectItem>
                    <SelectItem value="katakana">Katakana Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Unvoiced Pronounces</Label>
                <div className="flex justify-between items-center p-2 border rounded">
                  <Label className="text-sm">Select All</Label>
                  <Switch
                    checked={areAllSelected(settings.selectedSyllables)}
                    onCheckedChange={(checked) => {
                      const newState = Object.fromEntries(
                        Object.keys(settings.selectedSyllables).map((key) => [key, checked])
                      );
                      updateSettings({ selectedSyllables: newState });
                    }}
                  />
                </div>

                {Object.entries(syllableGroups).map(([key, label]) => (
                  <div key={key} className="flex justify-between items-center p-2 border rounded">
                    <Label>{label}</Label>
                    <Switch
                      checked={settings.selectedSyllables[key]}
                      onCheckedChange={() =>
                        updateSettings({
                          selectedSyllables: {
                            ...settings.selectedSyllables,
                            [key]: !settings.selectedSyllables[key],
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Voiced Pronounces</Label>
                <div className="flex justify-between items-center p-2 border rounded">
                  <Label className="text-sm">Select All</Label>
                  <Switch
                    checked={areAllSelected(settings.selectedVoicedSyllables)}
                    onCheckedChange={(checked) => {
                      const newState = Object.fromEntries(
                        Object.keys(settings.selectedVoicedSyllables).map((key) => [key, checked])
                      );
                      updateSettings({ selectedVoicedSyllables: newState });
                    }}
                  />
                </div>

                {Object.entries(voicedSyllableGroups).map(([key, label]) => (
                  <div key={key} className="flex justify-between items-center p-2 border rounded">
                    <Label>{label}</Label>
                    <Switch
                      checked={settings.selectedVoicedSyllables[key]}
                      onCheckedChange={() =>
                        updateSettings({
                          selectedVoicedSyllables: {
                            ...settings.selectedVoicedSyllables,
                            [key]: !settings.selectedVoicedSyllables[key],
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {sidebarOpen || <div onClick={getRandomPronounce} className="fixed inset-0 z-10" />}
      <div className="h-full">
        <Tabs
          className="h-full pt-4 md:pt-8 [@media(max-height:425px)]:pt-4 flex flex-col"
          value={mode}
          onValueChange={(value) => {
            setRomaji(null);
            setKana(null);
            setMode(value as Mode);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
        >
          <TabsList className="flex w-min mx-auto z-40 relative [@media(max-height:425px)]:scale-90 duration-300">
            <TabsTrigger value="romanjiToKana">Romanji → Kana</TabsTrigger>
            <TabsTrigger value="kanaToRomanji">Kana → Romanji</TabsTrigger>
          </TabsList>
          <div className="mt-1 md:mt-2 text-center text-muted-foreground [@media(max-height:425px)]:mt-1 [@media(max-height:425px)]:scale-90 duration-200">
            Press Enter/Space/Click Anywhere
          </div>
          <TabsContent className="flex-1 responsive-mb" value="romanjiToKana">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="responsive-text responsive-mb">{romaji}</div>
              {kana ? (
                <div className="responsive-text font-bold flex responsive-text-gap">
                  {settings.kanaVariant !== "katakana" && (
                    <span className="text-blue-500 ">{kana.h}</span>
                  )}
                  {settings.kanaVariant !== "hiragana" && (
                    <span className="text-red-500">{kana.k}</span>
                  )}
                </div>
              ) : (
                romaji && <div className="responsive-text font-bold text-gray-400">...</div>
              )}
            </div>
          </TabsContent>
          <TabsContent className="flex-1 responsive-mb" value="kanaToRomanji">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="responsive-text responsive-mb">
                <div className="responsive-text font-bold  flex responsive-text-gap">
                  {settings.kanaVariant !== "katakana" && (
                    <span className="text-blue-500">{kana?.h}</span>
                  )}
                  {settings.kanaVariant !== "hiragana" && (
                    <span className="text-red-500">{kana?.k}</span>
                  )}
                </div>
              </div>
              {romaji ? (
                <div className="responsive-text">{romaji}</div>
              ) : (
                kana && <div className="responsive-text font-bold text-gray-400">...</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default App;
