import { UploadedImage } from '../types';

interface ImageGalleryProps {
  images: UploadedImage[];
  deckSize: number;
  onRemoveImage: (id: string) => void;
  onReorderImages: (images: UploadedImage[]) => void;
  onImageClick: (imageUrl: string, imageId: string) => void;
}

export function ImageGallery({
  images,
  deckSize,
  onRemoveImage,
  onReorderImages,
  onImageClick,
}: ImageGalleryProps) {
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);

    if (dragIndex === dropIndex) return;

    const newImages = [...images];
    const [draggedImage] = newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    onReorderImages(newImages);
  };

  if (images.length === 0) {
    return (
      <div className="text-slate-500 text-sm py-4 text-center">
        No images uploaded yet
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-slate-600">
          {images.length} image{images.length !== 1 ? 's' : ''} uploaded
        </span>
        <span className="text-sm text-slate-500">
          {images.length >= deckSize
            ? 'Deck full'
            : `${deckSize - images.length} more needed for unique cards`}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative group aspect-[408/576] bg-slate-100 rounded overflow-hidden cursor-move"
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <img
              src={image.thumbnail}
              alt={image.name}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => onImageClick(image.preview, image.id)}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(image.id);
                }}
                className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 truncate">
              {index + 1}. {image.name}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Drag to reorder. Card order follows image order.
      </p>
    </div>
  );
}
