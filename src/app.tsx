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

type SettingsType = {
  delay: number;
  selectedSyllables: Record<string, boolean>;
  kanaVariant: "hiragana" | "katakana" | "both";
};

type Mode = "romanjiToKana" | "kanaToRomanji";

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [romaji, setRomaji] = useState<PronounceKey | null>(null);
  const [kana, setKana] = useState<Kana | null>(null);
  const [mode, setMode] = useState<Mode>("romanjiToKana");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
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
    kanaVariant: "both",
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
          className="w-[250px] md:w-[300px] flex flex-col h-full px-2 md:px-4"
        >
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-4">
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
                    updateSettings({ kanaVariant: value as "hiragana" | "katakana" | "both" })
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
                <Label>Pronounces</Label>
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
