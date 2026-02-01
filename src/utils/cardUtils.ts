import { CardDimensions } from '../types';

// TTS deck grid constants
export const COLS = 10;
export const ROWS = 7;
export const DECK_WIDTH = 4080;
export const DECK_HEIGHT = 4032;
export const CARD_NUMBER_WIDTH = 58;
export const CARD_NUMBER_HEIGHT = 150;

export function getCardDimensions(): CardDimensions {
  return {
    cols: COLS,
    rows: ROWS,
    cardWidth: DECK_WIDTH / COLS, // 408
    cardHeight: DECK_HEIGHT / ROWS, // 576
    numberWidth: CARD_NUMBER_WIDTH,
    numberHeight: CARD_NUMBER_HEIGHT,
  };
}

export function getCardPosition(pos: number): { x: number; y: number } {
  const dims = getCardDimensions();
  return {
    x: (pos % dims.cols) * dims.cardWidth,
    y: Math.floor(pos / dims.cols) * dims.cardHeight,
  };
}

export function isAspectRatioInTolerance(
  cardWidth: number,
  cardHeight: number,
  imageWidth: number,
  imageHeight: number,
  tolerance: number
): boolean {
  if (tolerance === 0) return true;
  const cardAR = cardWidth / cardHeight;
  const imageAR = imageWidth / imageHeight;
  return (cardAR / imageAR >= tolerance) && (imageAR / cardAR >= tolerance);
}
