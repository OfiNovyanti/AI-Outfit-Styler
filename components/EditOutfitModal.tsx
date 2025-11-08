import React, { useState, useEffect } from 'react';
import { GeneratedOutfit, Wardrobe, WardrobeCategory, WardrobeItem, WARDROBE_CATEGORIES, EditOutfitRequest } from '../types';
import { editOutfit } from '../services/geminiService';
import { toast } from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

interface EditOutfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  outfit: GeneratedOutfit;
  wardrobe: Wardrobe;
  onSave: (newOutfit: GeneratedOutfit) => void;
}

const layersForCategory: Partial<Record<WardrobeCategory, string[]>> = {
    tops: ['inner', 'outer'],
    hijabs: ['inner', 'outer'],
    // other categories default to a single layer
};

const EditOutfitModal: React.FC<EditOutfitModalProps> = ({ isOpen, onClose, outfit, wardrobe, onSave }) => {
  const [action, setAction] = useState<'change' | 'take_out' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<WardrobeCategory | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editedOutfit, setEditedOutfit] = useState<GeneratedOutfit | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAction(null);
      setSelectedCategory(null);
      setSelectedLayer(null);
      setSelectedItem(null);
      setEditedOutfit(null);
      setIsLoading(false);
    }
  }, [isOpen, outfit]);
  
  if (!isOpen) {
    return null;
  }
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value as WardrobeCategory;
    setSelectedCategory(category);
    setSelectedLayer(null);
    setSelectedItem(null);
  };
  
  const handleGenerateEdit = async () => {
    if (!action || !selectedCategory || !selectedLayer) {
        toast.error('Please complete all steps.');
        return;
    }
    if (action === 'change' && !selectedItem) {
      toast.error('Please select a replacement item from your wardrobe.');
      return;
    }

    setIsLoading(true);
    setEditedOutfit(null);

    const request: EditOutfitRequest = {
        action,
        category: selectedCategory,
        layer: selectedLayer,
        replacementItem: action === 'change' ? selectedItem! : undefined,
    };

    try {
      const result = await editOutfit(outfit, request);
      setEditedOutfit(result);
      toast.success("Edit generated successfully!");
    } catch (error) {
      console.error("Outfit editing failed:", error);
      toast.error("An error occurred while editing the outfit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = () => {
    if (editedOutfit) {
        onSave(editedOutfit);
    }
  };

  const availableCategories = WARDROBE_CATEGORIES.filter(cat => wardrobe[cat].length > 0);
  const currentLayers = selectedCategory ? (layersForCategory[selectedCategory] || ['base']) : [];
  const canGenerate = action && selectedCategory && selectedLayer && (action === 'take_out' || (action === 'change' && selectedItem));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="edit-outfit-title">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 id="edit-outfit-title" className="text-xl font-bold font-serif text-gray-800">Edit Your Outfit</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl" aria-label="Close modal">&times;</button>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left side: Image previews */}
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <h3 className="font-semibold text-gray-700 text-center mb-2">Before</h3>
                        <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                            <img src={outfit.image} alt={outfit.title} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-center font-semibold mt-2">{outfit.title}</p>
                     </div>
                     <div>
                        <h3 className="font-semibold text-gray-700 text-center mb-2">After</h3>
                        <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden shadow-sm flex items-center justify-center">
                            {isLoading ? (
                                <div className="text-center">
                                    <LoadingSpinner />
                                    <p className="text-sm text-gray-500 mt-2">Editing...</p>
                                </div>
                            ) : editedOutfit ? (
                                <img src={editedOutfit.image} alt={editedOutfit.title} className="w-full h-full object-cover" />
                            ) : (
                                <p className="text-gray-400 text-sm p-4 text-center">Your edited outfit will appear here.</p>
                            )}
                        </div>
                        {editedOutfit && <p className="text-center font-semibold mt-2">{editedOutfit.title}</p>}
                     </div>
                </div>

                {/* Right side: Controls */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2">1. Select Action</label>
                        <div className="flex space-x-4">
                            {(['change', 'take_out'] as const).map(act => (
                                <button key={act} onClick={() => setAction(act)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full ${action === act ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                  {act.charAt(0).toUpperCase() + act.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {action && (
                        <div>
                            <label htmlFor="component-select" className="block text-base font-semibold text-gray-700 mb-2">2. Select Target</label>
                            <div className="space-y-3">
                                <select
                                    id="component-select"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={selectedCategory || ''}
                                    onChange={handleCategoryChange}
                                >
                                    <option value="" disabled>Select a category...</option>
                                    {availableCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                    ))}
                                </select>
                                {selectedCategory && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Layer</label>
                                    <div className="flex space-x-2">
                                        {currentLayers.map(layer => (
                                            <button key={layer} onClick={() => setSelectedLayer(layer)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedLayer === layer ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                                                {layer.charAt(0).toUpperCase() + layer.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                        </div>
                    )}

                    {action === 'change' && selectedCategory && selectedLayer && (
                        <div>
                            <label className="block text-base font-semibold text-gray-700 mb-2">3. Select Replacement</label>
                            <div className="p-2 bg-gray-50 rounded-lg border max-h-48 overflow-y-auto">
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                    {wardrobe[selectedCategory].map((item, index) => (
                                        <button 
                                            key={index}
                                            onClick={() => setSelectedItem(item)}
                                            className={`relative aspect-square rounded-md overflow-hidden focus:outline-none ring-offset-2 ring-indigo-500 ${selectedItem?.base64 === item.base64 ? 'ring-2' : 'ring-1 ring-transparent hover:ring-1 hover:ring-gray-400'}`}
                                            aria-label={`Select ${item.name}`}
                                        >
                                            <img src={item.base64} alt={item.name} className="w-full h-full object-cover" />
                                            {selectedItem?.base64 === item.base64 && (
                                                <div className="absolute inset-0 bg-indigo-500 bg-opacity-40 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-3 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
            Cancel
          </button>
          {editedOutfit ? (
             <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700"
              >
                Save Changes
            </button>
          ) : (
            <button
                onClick={handleGenerateEdit}
                disabled={isLoading || !canGenerate}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Generating...' : 'Generate Edit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditOutfitModal;