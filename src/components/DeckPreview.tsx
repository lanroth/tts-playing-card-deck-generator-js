import { GenerationProgress } from '../types';

interface DeckPreviewProps {
  previewUrl: string | null;
  progress: GenerationProgress;
}

export function DeckPreview({ previewUrl, progress }: DeckPreviewProps) {
  return (
    <div className="bg-slate-100 rounded-lg p-4 h-full flex flex-col">
      <h3 className="font-semibold text-slate-700 mb-2">Deck Preview</h3>

      {progress.status === 'generating' && (
        <div className="mb-2">
          <div className="flex justify-between text-sm text-slate-600 mb-1">
            <span>{progress.message}</span>
            <span>{Math.round((progress.current / progress.total) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-200"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {progress.status === 'loading' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
            <p className="mt-2 text-sm text-slate-600">{progress.message}</p>
          </div>
        </div>
      )}

      {progress.status === 'error' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-500">
            <p className="font-medium">Error</p>
            <p className="text-sm">{progress.message}</p>
          </div>
        </div>
      )}

      {(progress.status === 'idle' || progress.status === 'complete') && previewUrl && (
        <div className="flex-1 overflow-auto">
          <img
            src={previewUrl}
            alt="Deck preview"
            className="w-full rounded border border-slate-200"
          />
        </div>
      )}

      {progress.status === 'idle' && !previewUrl && (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          <p className="text-center">
            Upload images to see preview
          </p>
        </div>
      )}
    </div>
  );
}
