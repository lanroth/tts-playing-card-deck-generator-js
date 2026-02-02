import { UploadedImage, DeckSettings, GenerationProgress } from '../types';
import {
  getCardDimensions,
  getCardPosition,
  DECK_WIDTH,
  DECK_HEIGHT,
  CARD_NUMBER_WIDTH,
  CARD_NUMBER_HEIGHT,
} from './cardUtils';

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const THUMBNAIL_MAX_WIDTH = 200;
const THUMBNAIL_MAX_HEIGHT = 280;

export async function createThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(
        THUMBNAIL_MAX_WIDTH / img.width,
        THUMBNAIL_MAX_HEIGHT / img.height,
        1 // Don't upscale small images
      );

      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for thumbnail'));
    };
    img.src = URL.createObjectURL(file);
  });
}

export function getCardFromTemplate(
  templateCanvas: HTMLCanvasElement,
  pos: number
): ImageData {
  const ctx = templateCanvas.getContext('2d')!;
  const dims = getCardDimensions();
  const { x, y } = getCardPosition(pos);
  return ctx.getImageData(x, y, dims.cardWidth, dims.cardHeight);
}

export function extractCardNumberOverlay(cardImageData: ImageData): ImageData {
  const dims = getCardDimensions();
  const data = new Uint8ClampedArray(cardImageData.data);

  // Make center area transparent (keep only corners)
  // Top-left corner: (0,0) to (numberWidth, numberHeight)
  // Bottom-right corner: (width-numberWidth, height-numberHeight) to (width, height)

  for (let y = 0; y < dims.cardHeight; y++) {
    for (let x = 0; x < dims.cardWidth; x++) {
      const idx = (y * dims.cardWidth + x) * 4;

      // Keep top-left corner (0 to numberWidth, 0 to numberHeight)
      const inTopLeft = x < CARD_NUMBER_WIDTH && y < CARD_NUMBER_HEIGHT;
      // Keep bottom-right corner
      const inBottomRight = x >= (dims.cardWidth - CARD_NUMBER_WIDTH) &&
                            y >= (dims.cardHeight - CARD_NUMBER_HEIGHT);

      if (!inTopLeft && !inBottomRight) {
        // Make transparent
        data[idx + 3] = 0;
      }
    }
  }

  return new ImageData(data, dims.cardWidth, dims.cardHeight);
}

export function resizeAndCrop(
  image: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;

  const imageAR = image.width / image.height;
  const targetAR = targetWidth / targetHeight;

  let srcX = 0, srcY = 0, srcW = image.width, srcH = image.height;

  if (imageAR > targetAR) {
    // Image is wider, crop horizontally
    srcW = image.height * targetAR;
    srcX = (image.width - srcW) / 2;
  } else {
    // Image is taller, crop vertically
    srcH = image.width / targetAR;
    srcY = (image.height - srcH) / 2;
  }

  ctx.drawImage(image, srcX, srcY, srcW, srcH, 0, 0, targetWidth, targetHeight);
  return canvas;
}

export function compositeOverlay(
  baseCanvas: HTMLCanvasElement,
  overlayImageData: ImageData
): HTMLCanvasElement {
  const ctx = baseCanvas.getContext('2d')!;

  // Create a temporary canvas for the overlay
  const overlayCanvas = document.createElement('canvas');
  overlayCanvas.width = overlayImageData.width;
  overlayCanvas.height = overlayImageData.height;
  const overlayCtx = overlayCanvas.getContext('2d')!;
  overlayCtx.putImageData(overlayImageData, 0, 0);

  // Draw overlay on top
  ctx.drawImage(overlayCanvas, 0, 0);

  return baseCanvas;
}

export function compositeOverlayScaled(
  baseCanvas: HTMLCanvasElement,
  overlayImageData: ImageData,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  const ctx = baseCanvas.getContext('2d')!;

  // Create a temporary canvas for the overlay at original size
  const overlayCanvas = document.createElement('canvas');
  overlayCanvas.width = overlayImageData.width;
  overlayCanvas.height = overlayImageData.height;
  const overlayCtx = overlayCanvas.getContext('2d')!;
  overlayCtx.putImageData(overlayImageData, 0, 0);

  // Draw overlay scaled to target size
  ctx.drawImage(overlayCanvas, 0, 0, targetWidth, targetHeight);

  return baseCanvas;
}

export interface DeckGenerationResult {
  canvas: HTMLCanvasElement;
  cardPreviews: string[]; // Data URLs for each unique card (one per uploaded image)
}

export interface GenerateDeckOptions {
  scale?: number; // 1 = full size, 0.25 = quarter size for preview
}

export async function generateDeck(
  templateSrc: string,
  images: UploadedImage[],
  settings: DeckSettings,
  onProgress?: (progress: GenerationProgress) => void,
  options: GenerateDeckOptions = {}
): Promise<DeckGenerationResult> {
  const { scale = 1 } = options;
  const dims = getCardDimensions();
  const scaledDeckWidth = Math.round(DECK_WIDTH * scale);
  const scaledDeckHeight = Math.round(DECK_HEIGHT * scale);
  const scaledCardWidth = Math.round(dims.cardWidth * scale);
  const scaledCardHeight = Math.round(dims.cardHeight * scale);

  // Report loading status
  onProgress?.({
    current: 0,
    total: settings.deckSize,
    status: 'loading',
    message: 'Loading template...',
  });

  // Load template image
  const templateImg = await loadImage(templateSrc);

  // Create template canvas at full size (needed for overlay extraction)
  const templateCanvas = document.createElement('canvas');
  templateCanvas.width = DECK_WIDTH;
  templateCanvas.height = DECK_HEIGHT;
  const templateCtx = templateCanvas.getContext('2d')!;
  templateCtx.drawImage(templateImg, 0, 0, DECK_WIDTH, DECK_HEIGHT);

  // Create output canvas at scaled size
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = scaledDeckWidth;
  outputCanvas.height = scaledDeckHeight;
  const outputCtx = outputCanvas.getContext('2d')!;

  // Copy template to output (scaled)
  outputCtx.drawImage(templateCanvas, 0, 0, scaledDeckWidth, scaledDeckHeight);

  if (images.length === 0) {
    return { canvas: outputCanvas, cardPreviews: [] };
  }

  // Load all user images (use thumbnails for scaled preview, full images for full size)
  onProgress?.({
    current: 0,
    total: settings.deckSize,
    status: 'loading',
    message: 'Loading images...',
  });

  const loadedImages = await Promise.all(
    images.map(img => loadImage(scale < 1 ? img.thumbnail : img.preview))
  );

  // Store card previews for each unique image (first occurrence of each)
  const cardPreviews: string[] = new Array(images.length).fill('');

  // Generate each card
  for (let i = 0; i < settings.deckSize; i++) {
    onProgress?.({
      current: i,
      total: settings.deckSize,
      status: 'generating',
      message: `Generating card ${i + 1}/${settings.deckSize}`,
    });

    // Get card overlay from template (at full size, then scale)
    const cardImageData = getCardFromTemplate(templateCanvas, i);
    const overlayImageData = extractCardNumberOverlay(cardImageData);

    // Get user image (cycle through if fewer images than cards)
    const imageIndex = i % loadedImages.length;
    const userImage = loadedImages[imageIndex];

    // Resize and crop user image to scaled card size
    const cardCanvas = resizeAndCrop(userImage, scaledCardWidth, scaledCardHeight);

    // Composite scaled overlay on top
    compositeOverlayScaled(cardCanvas, overlayImageData, scaledCardWidth, scaledCardHeight);

    // Save the first card preview for each unique image (only at full scale)
    if (scale === 1 && cardPreviews[imageIndex] === '') {
      cardPreviews[imageIndex] = cardCanvas.toDataURL('image/png');
    }

    // Place card in output grid (scaled position)
    const pos = getCardPosition(i);
    const scaledX = Math.round(pos.x * scale);
    const scaledY = Math.round(pos.y * scale);
    outputCtx.drawImage(cardCanvas, scaledX, scaledY);
  }

  // Handle hidden card (position 69 - last position in the grid)
  if (settings.hiddenCardImage) {
    const hiddenImg = await loadImage(scale < 1 ? settings.hiddenCardImage.thumbnail : settings.hiddenCardImage.preview);
    const hiddenCanvas = resizeAndCrop(hiddenImg, scaledCardWidth, scaledCardHeight);
    const pos = getCardPosition(69);
    const scaledX = Math.round(pos.x * scale);
    const scaledY = Math.round(pos.y * scale);
    outputCtx.drawImage(hiddenCanvas, scaledX, scaledY);
  }

  onProgress?.({
    current: settings.deckSize,
    total: settings.deckSize,
    status: 'complete',
    message: 'Deck generated!',
  });

  return { canvas: outputCanvas, cardPreviews };
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function downloadCanvasAsJpeg(canvas: HTMLCanvasElement, filename: string, quality: number): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/jpeg', quality);
  link.click();
}

export function canvasToDataURL(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}

export async function getCanvasFileSize(canvas: HTMLCanvasElement, type: 'image/png' | 'image/jpeg', quality?: number): Promise<number> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob?.size ?? 0);
    }, type, quality);
  });
}
