import { useState } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ImageGallery } from './components/ImageGallery';
import { SettingsPanel } from './components/SettingsPanel';
import { DeckPreview } from './components/DeckPreview';
import { DownloadButton } from './components/DownloadButton';
import { ImagePopover } from './components/ImagePopover';
import { useDeckGenerator } from './hooks/useDeckGenerator';

function App() {
  const {
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
  } = useDeckGenerator();

  const [popoverIndex, setPopoverIndex] = useState<number | null>(null);

  const handleImageClick = (_url: string, id: string) => {
    const index = images.findIndex(img => img.id === id);
    if (index !== -1) {
      setPopoverIndex(index);
    }
  };

  const handleDeleteFromPopover = () => {
    if (popoverIndex !== null && images[popoverIndex]) {
      const idToRemove = images[popoverIndex].id;
      removeImage(idToRemove);
      // After deletion, stay at same index (which will show next image)
      // or go to previous if we were at the end
      if (images.length <= 1) {
        setPopoverIndex(null);
      } else if (popoverIndex >= images.length - 1) {
        setPopoverIndex(popoverIndex - 1);
      }
      // Otherwise stay at same index - the next image slides into place
    }
  };

  const handlePrevImage = () => {
    if (popoverIndex !== null && popoverIndex > 0) {
      setPopoverIndex(popoverIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (popoverIndex !== null && popoverIndex < images.length - 1) {
      setPopoverIndex(popoverIndex + 1);
    }
  };

  // Use the card preview (with number overlay) if available, otherwise fall back to raw image
  const currentPopoverImageUrl = popoverIndex !== null
    ? (cardPreviews[popoverIndex] || images[popoverIndex]?.preview)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left Column - Upload and Gallery */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-slate-700 mb-3">Upload Images</h2>
              <ImageUploader onImagesAdded={addImages} />
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex-1 flex flex-col min-h-0">
              <h2 className="font-semibold text-slate-700 mb-3">Image Gallery</h2>
              <ImageGallery
                images={images}
                deckSize={settings.deckSize}
                onRemoveImage={removeImage}
                onReorderImages={reorderImages}
                onImageClick={handleImageClick}
              />
            </div>
          </div>

          {/* Right Column - Preview, Settings, and Download */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-white rounded-lg shadow p-4 flex-1 min-h-[400px]">
              <DeckPreview
                previewUrl={previewUrl}
                progress={progress}
                images={images}
                deckSize={settings.deckSize}
                onCardClick={handleImageClick}
              />
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <SettingsPanel
                settings={settings}
                onSettingsChange={updateSettings}
              />
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <DownloadButton
                onDownloadPng={download}
                onDownloadJpeg={downloadJpeg}
                disabled={images.length === 0}
                progress={progress}
                jpegQuality={settings.jpegQuality}
                onJpegQualityChange={(quality) => updateSettings({ ...settings, jpegQuality: quality })}
                pngSize={pngSize}
                jpegSize={jpegSize}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-400 py-3 px-6 text-center text-sm">
        TTS Playing Card Deck Generator - All processing done in your browser
      </footer>

      <ImagePopover
        imageUrl={currentPopoverImageUrl}
        onClose={() => setPopoverIndex(null)}
        onDelete={handleDeleteFromPopover}
        onPrev={handlePrevImage}
        onNext={handleNextImage}
        hasPrev={popoverIndex !== null && popoverIndex > 0}
        hasNext={popoverIndex !== null && popoverIndex < images.length - 1}
        currentIndex={popoverIndex ?? 0}
        totalCount={images.length}
      />
    </div>
  );
}

export default App;
