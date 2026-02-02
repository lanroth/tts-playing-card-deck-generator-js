import { useState, useCallback, useRef, useEffect } from 'react';
import { UploadedImage, DeckSettings, GenerationProgress } from '../types';
import { generateDeck, downloadCanvas, downloadCanvasAsJpeg, canvasToDataURL } from '../utils/imageProcessing';

const PREVIEW_SCALE = 0.25; // Generate preview at 1/4 size for performance

const DEFAULT_SETTINGS: DeckSettings = {
  deckSize: 52,
  aspectRatioTolerance: 0,
  jpegQuality: 0.92,
};

const TEMPLATE_PATH = '/card_template.png';

export function useDeckGenerator() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [settings, setSettings] = useState<DeckSettings>(DEFAULT_SETTINGS);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<GenerationProgress>({
    current: 0,
    total: 0,
    status: 'idle',
  });
  const [pngSize, setPngSize] = useState<number>(0);
  const [jpegSize, setJpegSize] = useState<number>(0);
  const [cardPreviews, setCardPreviews] = useState<string[]>([]);

  const generatedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const debounceRef = useRef<number | null>(null);

  const regenerate = useCallback(async () => {
    if (images.length === 0) {
      setPreviewUrl(null);
      setProgress({ current: 0, total: 0, status: 'idle' });
      setPngSize(0);
      setJpegSize(0);
      setCardPreviews([]);
      return;
    }

    try {
      // Generate scaled preview for fast display
      const result = await generateDeck(
        TEMPLATE_PATH,
        images,
        settings,
        setProgress,
        { scale: PREVIEW_SCALE }
      );

      generatedCanvasRef.current = null; // Clear cached full-size canvas
      setPreviewUrl(canvasToDataURL(result.canvas));
      setCardPreviews([]); // Card previews only generated at full scale

      // Estimate file sizes based on scaled preview
      setPngSize(0);
      setJpegSize(0);
    } catch (error) {
      console.error('Failed to generate deck:', error);
      setProgress({
        current: 0,
        total: 0,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [images, settings]);

  // Debounced regeneration when inputs change
  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      regenerate();
    }, 300);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [regenerate]);

  const addImages = useCallback((newImages: UploadedImage[]) => {
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const reorderImages = useCallback((newOrder: UploadedImage[]) => {
    setImages(newOrder);
  }, []);

  const updateSettings = useCallback((newSettings: DeckSettings) => {
    setSettings(newSettings);
  }, []);

  const generateFullSize = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    if (images.length === 0) return null;

    // Use cached full-size canvas if available
    if (generatedCanvasRef.current) {
      return generatedCanvasRef.current;
    }

    setProgress({
      current: 0,
      total: settings.deckSize,
      status: 'generating',
      message: 'Generating full-size deck...',
    });

    const result = await generateDeck(
      TEMPLATE_PATH,
      images,
      settings,
      setProgress,
      { scale: 1 }
    );

    generatedCanvasRef.current = result.canvas;
    setCardPreviews(result.cardPreviews);
    return result.canvas;
  }, [images, settings]);

  const download = useCallback(async () => {
    const canvas = await generateFullSize();
    if (canvas) {
      downloadCanvas(canvas, 'card_deck.png');
    }
  }, [generateFullSize]);

  const downloadJpeg = useCallback(async () => {
    const canvas = await generateFullSize();
    if (canvas) {
      downloadCanvasAsJpeg(canvas, 'card_deck.jpg', settings.jpegQuality);
    }
  }, [generateFullSize, settings.jpegQuality]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      if (settings.hiddenCardImage) {
        URL.revokeObjectURL(settings.hiddenCardImage.preview);
      }
    };
  }, []);

  return {
    images,
    settings,
    previewUrl,
    progress,
    pngSize,
    jpegSize,
    cardPreviews,
    addImages,
    removeImage,
    reorderImages,
    updateSettings,
    download,
    downloadJpeg,
  };
}
