import { GenerationProgress } from '../types';

interface DownloadButtonProps {
  onDownload: () => void;
  disabled: boolean;
  progress: GenerationProgress;
}

export function DownloadButton({ onDownload, disabled, progress }: DownloadButtonProps) {
  const isGenerating = progress.status === 'generating' || progress.status === 'loading';

  return (
    <button
      onClick={onDownload}
      disabled={disabled || isGenerating}
      className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
        disabled || isGenerating
          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
    >
      {isGenerating ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          Generating...
        </span>
      ) : (
        'Download Deck (PNG)'
      )}
    </button>
  );
}
