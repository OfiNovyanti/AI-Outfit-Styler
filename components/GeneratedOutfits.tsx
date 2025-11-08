import React, { useState } from 'react';
import { GeneratedOutfit, Wardrobe } from '../types';
import LoadingSpinner from './LoadingSpinner';
import EditOutfitModal from './EditOutfitModal';
import { PencilIcon, SparklesIcon } from './IconComponents';

interface GeneratedOutfitsProps {
  outfits: GeneratedOutfit[];
  isLoading: boolean;
  wardrobe: Wardrobe;
  onOutfitUpdate: (index: number, newOutfit: GeneratedOutfit) => void;
  onGenerateMore: () => void;
}

const GeneratedOutfits: React.FC<GeneratedOutfitsProps> = ({ outfits, isLoading, wardrobe, onOutfitUpdate, onGenerateMore }) => {
  const hasOutfits = outfits.length > 0;
  const [editingOutfitIndex, setEditingOutfitIndex] = useState<number | null>(null);

  const handleEditClick = (index: number) => {
    setEditingOutfitIndex(index);
  };

  const handleCloseModal = () => {
    setEditingOutfitIndex(null);
  };
  
  const handleSaveChanges = (newOutfit: GeneratedOutfit) => {
    if (editingOutfitIndex !== null) {
      onOutfitUpdate(editingOutfitIndex, newOutfit);
    }
    handleCloseModal();
  };

  return (
    <>
      <div className="p-6 bg-white rounded-xl shadow-md min-h-[400px] flex flex-col">
        <h2 className="text-2xl font-bold font-serif text-gray-800 mb-6 text-center">Your Outfit Ideas</h2>
        <div className="flex-grow">
          {isLoading && !hasOutfits && ( // Show this only on initial load
            <div className="flex flex-col items-center justify-center h-full">
              <LoadingSpinner />
              <p className="text-gray-600 mt-4">Generating your unique style...</p>
            </div>
          )}
          {!isLoading && !hasOutfits && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>Your generated outfits will appear here.</p>
              <p className="text-sm">Fill out the form to get started!</p>
            </div>
          )}
          {hasOutfits && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {outfits.map((outfit, index) => (
                <div key={index} className="group overflow-hidden rounded-lg shadow-lg flex flex-col">
                  <div className="aspect-[3/4] bg-gray-200 overflow-hidden">
                    <img
                      src={outfit.image}
                      alt={outfit.title}
                      className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 bg-white flex-grow flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-800 text-center flex-grow">{outfit.title}</h3>
                    <button
                      onClick={() => handleEditClick(index)}
                      className="ml-2 p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
                      aria-label="Edit outfit"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {isLoading && hasOutfits && ( // Show spinner at bottom when loading more
            <div className="flex justify-center mt-6">
              <LoadingSpinner />
            </div>
          )}
        </div>
        {!isLoading && hasOutfits && (
          <div className="mt-8 text-center">
            <button
              onClick={onGenerateMore}
              disabled={isLoading}
              className="w-full sm:w-auto flex justify-center items-center py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              Another Five
            </button>
          </div>
        )}
      </div>
      
      {editingOutfitIndex !== null && (
        <EditOutfitModal
          isOpen={editingOutfitIndex !== null}
          onClose={handleCloseModal}
          outfit={outfits[editingOutfitIndex]}
          wardrobe={wardrobe}
          onSave={handleSaveChanges}
        />
      )}
    </>
  );
};

export default GeneratedOutfits;