
import React, { useCallback } from 'react';
import { Wardrobe, WardrobeItem, WardrobeCategory, WARDROBE_CATEGORIES } from '../types';
import ImagePreview from './ImagePreview';
import { UploadIcon } from './IconComponents';

interface WardrobeUploaderProps {
  wardrobe: Wardrobe;
  onWardrobeUpdate: (category: WardrobeCategory, items: WardrobeItem[]) => void;
  onItemDelete: (category: WardrobeCategory, index: number) => void;
}

const CategoryUploader: React.FC<{
  category: WardrobeCategory;
  items: WardrobeItem[];
  onUpdate: (items: WardrobeItem[]) => void;
  onDelete: (index: number) => void;
}> = ({ category, items, onUpdate, onDelete }) => {
  
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newItems: WardrobeItem[] = [];
    let processedCount = 0;

    // FIX: Explicitly type `file` as `File` to resolve type inference errors.
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newItems.push({ name: file.name, base64: e.target.result as string });
        }
        processedCount++;
        if (processedCount === files.length) {
          onUpdate(newItems);
        }
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  }, [onUpdate]);

  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-gray-700">{categoryTitle}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
        {items.map((item, index) => (
          <ImagePreview 
            key={`${category}-${index}`} 
            src={item.base64} 
            alt={item.name} 
            onDelete={() => onDelete(index)}
          />
        ))}
      </div>
      <label className="cursor-pointer flex items-center justify-center w-full px-4 py-6 bg-white text-gray-500 rounded-lg shadow-sm tracking-wide border border-dashed border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors">
        <UploadIcon className="w-6 h-6 mr-2"/>
        <span className="text-base leading-normal">Add {categoryTitle}</span>
        <input type='file' className="hidden" multiple accept="image/png, image/jpeg" onChange={handleFileChange} />
      </label>
    </div>
  );
};


const WardrobeUploader: React.FC<WardrobeUploaderProps> = ({ wardrobe, onWardrobeUpdate, onItemDelete }) => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold font-serif text-gray-800">1. Upload Your Wardrobe</h2>
      {WARDROBE_CATEGORIES.map(category => (
        <CategoryUploader
          key={category}
          category={category}
          items={wardrobe[category]}
          onUpdate={(items) => onWardrobeUpdate(category, items)}
          onDelete={(index) => onItemDelete(category, index)}
        />
      ))}
    </div>
  );
};

export default WardrobeUploader;