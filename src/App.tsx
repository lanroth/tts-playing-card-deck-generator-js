import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ImageGallery } from './components/ImageGallery';
import { SettingsPanel } from './components/SettingsPanel';
import { DeckPreview } from './components/DeckPreview';
import { DownloadButton } from './components/DownloadButton';
import { useDeckGenerator } from './hooks/useDeckGenerator';

function App() {
  const {
    images,
    settings,
    previewUrl,
    progress,
    addImages,
    removeImage,
    reorderImages,
    updateSettings,
    download,
  } = useDeckGenerator();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left Column - Upload, Gallery, Settings */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-slate-700 mb-3">Upload Images</h2>
              <ImageUploader onImagesAdded={addImages} />
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-slate-700 mb-3">Image Gallery</h2>
              <ImageGallery
                images={images}
                deckSize={settings.deckSize}
                onRemoveImage={removeImage}
                onReorderImages={reorderImages}
              />
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <SettingsPanel
                settings={settings}
                onSettingsChange={updateSettings}
              />
            </div>
          </div>

          {/* Right Column - Preview and Download */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-white rounded-lg shadow p-4 flex-1 min-h-[400px]">
              <DeckPreview previewUrl={previewUrl} progress={progress} />
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <DownloadButton
                onDownload={download}
                disabled={images.length === 0}
                progress={progress}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-400 py-3 px-6 text-center text-sm">
        TTS Playing Card Deck Generator - All processing done in your browser
      </footer>
    </div>
  );
}

export default App;
