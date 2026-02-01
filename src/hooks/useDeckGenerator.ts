import { useState, useCallback, useRef, useEffect } from 'react';
import { UploadedImage, DeckSettings, GenerationProgress } from '../types';
import { generateDeck, downloadCanvas, canvasToDataURL } from '../utils/imageProcessing';

const DEFAULT_SETTINGS: DeckSettings = {
  deckSize: 52,
  aspectRatioTolerance: 0,
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

  const generatedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const debounceRef = useRef<number | null>(null);

  const regenerate = useCallback(async () => {
    if (images.length === 0) {
      setPreviewUrl(null);
      setProgress({ current: 0, total: 0, status: 'idle' });
      return;
    }

    try {
      const canvas = await generateDeck(
        TEMPLATE_PATH,
        images,
        settings,
        setProgress
      );

      generatedCanvasRef.current = canvas;
      setPreviewUrl(canvasToDataURL(canvas));
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

  const download = useCallback(() => {
    if (generatedCanvasRef.current) {
      downloadCanvas(generatedCanvasRef.current, 'card_deck.png');
    }
  }, []);

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
    addImages,
    removeImage,
    reorderImages,
    updateSettings,
    download,
  };
}
