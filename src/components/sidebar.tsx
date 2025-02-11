export type SettingsType = { delay: number; selectedSyllables: Record<string, boolean> };

type SidebarProps = {
  open: boolean;
  close: () => void;
  settings: { delay: number; selectedSyllables: Record<string, boolean> };
  updateSettings: (newSettings: Partial<SettingsType>) => void;
};

export const syllableGroups: Record<string, string> = {
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

const Sidebar = ({ open, close, settings, updateSettings }: SidebarProps) => {
  const handleDelayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ delay: Number(event.target.value) });
  };

  const toggleSyllable = (key: string) => {
    updateSettings({
      selectedSyllables: {
        ...settings.selectedSyllables,
        [key]: !settings.selectedSyllables[key],
      },
    });
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-neutral-900 opacity-30 z-40" onClick={close} />}
      <div
        className={`overflow-auto fixed z-50 w-[300px] bg-white top-0 bottom-0 duration-300 shadow-sm border-r border-gray-300 p-4 
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-4 flex items-center space-x-2 w-full">
          <label htmlFor="delay" className="block font-medium whitespace-nowrap">
            Delay (s):
          </label>
          <input
            id="delay"
            className="flex-1 border rounded border-gray-300 px-1 py-0.5 min-w-0"
            type="number"
            min="0"
            value={settings.delay}
            onChange={handleDelayChange}
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium">Pronounces:</label>
          {Object.entries(syllableGroups).map(([key, label]) => (
            <div key={key} className="flex items-center bg-gray-100 rounded px-2">
              <input
                className="cursor-pointer w-4 h-4"
                id={key}
                type="checkbox"
                checked={settings.selectedSyllables[key]}
                onChange={() => toggleSyllable(key)}
              />
              <label htmlFor={key} className="pl-2 w-full py-1 cursor-pointer">
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
