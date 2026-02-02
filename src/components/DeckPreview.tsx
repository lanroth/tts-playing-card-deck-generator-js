import { useRef } from 'react';
import { GenerationProgress, UploadedImage } from '../types';
import { COLS, ROWS } from '../utils/cardUtils';

interface DeckPreviewProps {
  previewUrl: string | null;
  progress: GenerationProgress;
  images: UploadedImage[];
  deckSize: number;
  onCardClick: (imageUrl: string, imageId: string) => void;
}

export function DeckPreview({ previewUrl, progress, images, deckSize, onCardClick }: DeckPreviewProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current || images.length === 0) return;

    const rect = imgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Calculate the scale factor (displayed size vs natural size)
    const scaleX = imgRef.current.naturalWidth / rect.width;
    const scaleY = imgRef.current.naturalHeight / rect.height;

    // Convert click position to natural image coordinates
    const naturalX = clickX * scaleX;
    const naturalY = clickY * scaleY;

    // Calculate card dimensions in the grid
    const cardWidth = imgRef.current.naturalWidth / COLS;
    const cardHeight = imgRef.current.naturalHeight / ROWS;

    // Determine which card was clicked
    const col = Math.floor(naturalX / cardWidth);
    const row = Math.floor(naturalY / cardHeight);
    const cardIndex = row * COLS + col;

    // Only respond to clicks on actual cards (within deckSize)
    if (cardIndex < deckSize) {
      // Map card index to the original image (cards cycle through images)
      const imageIndex = cardIndex % images.length;
      const image = images[imageIndex];
      onCardClick(image.preview, image.id);
    }
  };

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
            ref={imgRef}
            src={previewUrl}
            alt="Deck preview"
            className="w-full rounded border border-slate-200 cursor-pointer"
            onClick={handleImageClick}
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
