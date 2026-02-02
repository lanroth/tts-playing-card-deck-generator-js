import { GenerationProgress } from '../types';

interface DownloadButtonProps {
  onDownloadPng: () => void;
  onDownloadJpeg: () => void;
  disabled: boolean;
  progress: GenerationProgress;
  jpegQuality: number;
  onJpegQualityChange: (quality: number) => void;
  pngSize: number;
  jpegSize: number;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function DownloadButton({
  onDownloadPng,
  onDownloadJpeg,
  disabled,
  progress,
  jpegQuality,
  onJpegQualityChange,
  pngSize,
  jpegSize,
}: DownloadButtonProps) {
  const isGenerating = progress.status === 'generating' || progress.status === 'loading';

  const disabledStyle = "bg-slate-300 text-slate-500 cursor-not-allowed";
  const pngStyle = "bg-blue-500 text-white hover:bg-blue-600";
  const jpegStyle = "bg-green-500 text-white hover:bg-green-600";

  if (isGenerating) {
    return (
      <button
        disabled
        className={`w-full py-3 px-6 rounded-lg font-semibold ${disabledStyle}`}
      >
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400" />
          Generating...
        </span>
      </button>
    );
  }

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <button
          onClick={onDownloadPng}
          disabled={disabled}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${disabled ? disabledStyle : pngStyle}`}
        >
          Download PNG
        </button>
        <div className="text-center text-sm text-slate-500 mt-1">
          {formatFileSize(pngSize)}
        </div>
      </div>
      <div className="flex-1 space-y-1">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            JPG Quality
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.01"
              value={jpegQuality}
              onChange={(e) => onJpegQualityChange(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-slate-600 w-12 text-right">
              {Math.round(jpegQuality * 100)}%
            </span>
          </div>
        </div>
        <button
          onClick={onDownloadJpeg}
          disabled={disabled}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${disabled ? disabledStyle : jpegStyle}`}
        >
          Download JPG
        </button>
        <div className="text-center text-sm text-slate-500">
          {formatFileSize(jpegSize)}
        </div>
      </div>
    </div>
  );
}
