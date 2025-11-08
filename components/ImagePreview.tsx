
import React from 'react';
import { TrashIcon } from './IconComponents';

interface ImagePreviewProps {
  src: string;
  alt: string;
  onDelete: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ src, alt, onDelete }) => {
  return (
    <div className="relative group aspect-square">
      <img src={src} alt={alt} className="w-full h-full object-cover rounded-md shadow-sm" />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center rounded-md">
        <button 
          onClick={onDelete} 
          className="p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          aria-label="Delete image"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ImagePreview;
