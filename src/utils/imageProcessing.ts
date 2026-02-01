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

export async function generateDeck(
  templateSrc: string,
  images: UploadedImage[],
  settings: DeckSettings,
  onProgress?: (progress: GenerationProgress) => void
): Promise<HTMLCanvasElement> {
  const dims = getCardDimensions();

  // Report loading status
  onProgress?.({
    current: 0,
    total: settings.deckSize,
    status: 'loading',
    message: 'Loading template...',
  });

  // Load template image
  const templateImg = await loadImage(templateSrc);

  // Create template canvas
  const templateCanvas = document.createElement('canvas');
  templateCanvas.width = DECK_WIDTH;
  templateCanvas.height = DECK_HEIGHT;
  const templateCtx = templateCanvas.getContext('2d')!;
  templateCtx.drawImage(templateImg, 0, 0, DECK_WIDTH, DECK_HEIGHT);

  // Create output canvas
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = DECK_WIDTH;
  outputCanvas.height = DECK_HEIGHT;
  const outputCtx = outputCanvas.getContext('2d')!;

  // Copy template to output first
  outputCtx.drawImage(templateCanvas, 0, 0);

  if (images.length === 0) {
    return outputCanvas;
  }

  // Load all user images
  onProgress?.({
    current: 0,
    total: settings.deckSize,
    status: 'loading',
    message: 'Loading images...',
  });

  const loadedImages = await Promise.all(
    images.map(img => loadImage(img.preview))
  );

  // Generate each card
  for (let i = 0; i < settings.deckSize; i++) {
    onProgress?.({
      current: i,
      total: settings.deckSize,
      status: 'generating',
      message: `Generating card ${i + 1}/${settings.deckSize}`,
    });

    // Get card overlay from template
    const cardImageData = getCardFromTemplate(templateCanvas, i);
    const overlayImageData = extractCardNumberOverlay(cardImageData);

    // Get user image (cycle through if fewer images than cards)
    const userImage = loadedImages[i % loadedImages.length];

    // Resize and crop user image to card size
    const cardCanvas = resizeAndCrop(userImage, dims.cardWidth, dims.cardHeight);

    // Composite overlay on top
    compositeOverlay(cardCanvas, overlayImageData);

    // Place card in output grid
    const { x, y } = getCardPosition(i);
    outputCtx.drawImage(cardCanvas, x, y);
  }

  // Handle hidden card (position 69 - last position in the grid)
  if (settings.hiddenCardImage) {
    const hiddenImg = await loadImage(settings.hiddenCardImage.preview);
    const hiddenCanvas = resizeAndCrop(hiddenImg, dims.cardWidth, dims.cardHeight);
    const { x, y } = getCardPosition(69);
    outputCtx.drawImage(hiddenCanvas, x, y);
  }

  onProgress?.({
    current: settings.deckSize,
    total: settings.deckSize,
    status: 'complete',
    message: 'Deck generated!',
  });

  return outputCanvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function canvasToDataURL(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}
