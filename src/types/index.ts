export interface UploadedImage {
  id: string;
  file: File;
  preview: string; // object URL
  name: string;
}

export interface DeckSettings {
  deckSize: number;        // default 52
  aspectRatioTolerance: number; // 0-1
  hiddenCardImage?: UploadedImage;
}

export interface CardDimensions {
  cols: number;  // 10
  rows: number;  // 7
  cardWidth: number;
  cardHeight: number;
  numberWidth: number;   // 58
  numberHeight: number;  // 150
}

export interface GenerationProgress {
  current: number;
  total: number;
  status: 'idle' | 'loading' | 'generating' | 'complete' | 'error';
  message?: string;
}
