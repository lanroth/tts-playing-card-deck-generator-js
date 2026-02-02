import { useEffect, useCallback } from 'react';

interface ImagePopoverProps {
  imageUrl: string | null;
  alt?: string;
  onClose: () => void;
  onDelete?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalCount?: number;
}

export function ImagePopover({
  imageUrl,
  alt = 'Full size image',
  onClose,
  onDelete,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  currentIndex = 0,
  totalCount = 0,
}: ImagePopoverProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Delete' && onDelete) {
      onDelete();
    } else if (e.key === 'ArrowLeft' && onPrev && hasPrev) {
      onPrev();
    } else if (e.key === 'ArrowRight' && onNext && hasNext) {
      onNext();
    }
  }, [onClose, onDelete, onPrev, onNext, hasPrev, hasNext]);

  useEffect(() => {
    if (imageUrl) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [imageUrl, handleKeyDown]);

  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Top bar with counter, delete, and close */}
      <div className="absolute top-4 right-4 flex items-center gap-4">
        {totalCount > 0 && (
          <span className="text-white text-sm">
            {currentIndex + 1} / {totalCount}
          </span>
        )}
        {onDelete && (
          <button
            className="text-white hover:text-red-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete"
            title="Delete (Del)"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
        <button
          className="text-white hover:text-slate-300 transition-colors"
          onClick={onClose}
          aria-label="Close"
          title="Close (Esc)"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Previous button */}
      {onPrev && (
        <button
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full transition-colors ${
            hasPrev ? 'hover:bg-white/20' : 'opacity-30 cursor-not-allowed'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (hasPrev) onPrev();
          }}
          disabled={!hasPrev}
          aria-label="Previous"
          title="Previous (←)"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Image */}
      <img
        src={imageUrl}
        alt={alt}
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next button */}
      {onNext && (
        <button
          className={`absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full transition-colors ${
            hasNext ? 'hover:bg-white/20' : 'opacity-30 cursor-not-allowed'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (hasNext) onNext();
          }}
          disabled={!hasNext}
          aria-label="Next"
          title="Next (→)"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
