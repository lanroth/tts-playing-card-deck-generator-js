import { DeckSettings, UploadedImage } from '../types';

interface SettingsPanelProps {
  settings: DeckSettings;
  onSettingsChange: (settings: DeckSettings) => void;
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const handleDeckSizeChange = (value: string) => {
    const size = parseInt(value, 10);
    if (!isNaN(size) && size > 0 && size <= 69) {
      onSettingsChange({ ...settings, deckSize: size });
    }
  };

  const handleToleranceChange = (value: number) => {
    onSettingsChange({ ...settings, aspectRatioTolerance: value });
  };

  const handleHiddenCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const hiddenCardImage: UploadedImage = {
        id: `hidden-${Date.now()}`,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      };
      onSettingsChange({ ...settings, hiddenCardImage });
    }
  };

  const handleRemoveHiddenCard = () => {
    if (settings.hiddenCardImage) {
      URL.revokeObjectURL(settings.hiddenCardImage.preview);
    }
    onSettingsChange({ ...settings, hiddenCardImage: undefined });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-700">Settings</h3>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Deck Size
        </label>
        <div className="flex gap-2">
          {[52, 54].map((size) => (
            <button
              key={size}
              onClick={() => onSettingsChange({ ...settings, deckSize: size })}
              className={`px-3 py-1 rounded text-sm ${
                settings.deckSize === size
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {size}
            </button>
          ))}
          <input
            type="number"
            min="1"
            max="69"
            value={settings.deckSize}
            onChange={(e) => handleDeckSizeChange(e.target.value)}
            className="w-20 px-2 py-1 border rounded text-sm"
            placeholder="Custom"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Aspect Ratio Tolerance: {settings.aspectRatioTolerance.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={settings.aspectRatioTolerance}
          onChange={(e) => handleToleranceChange(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>Any ratio</span>
          <span>Exact match</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Hidden Card Image (Card Back)
        </label>
        {settings.hiddenCardImage ? (
          <div className="flex items-center gap-2">
            <img
              src={settings.hiddenCardImage.preview}
              alt="Hidden card"
              className="w-12 h-16 object-cover rounded"
            />
            <span className="text-sm text-slate-600 flex-1 truncate">
              {settings.hiddenCardImage.name}
            </span>
            <button
              onClick={handleRemoveHiddenCard}
              className="text-red-500 hover:text-red-600 text-sm"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleHiddenCardChange}
              className="text-sm text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>
        )}
      </div>
    </div>
  );
}
