
import React, { useState } from 'react';
import { OutfitRequest, WardrobeCategory, WARDROBE_CATEGORIES } from '../types';
import { SparklesIcon } from './IconComponents';

interface OutfitGeneratorFormProps {
  onGenerate: (request: OutfitRequest) => void;
  isLoading: boolean;
}

const componentOptions: { id: WardrobeCategory; label: string }[] = WARDROBE_CATEGORIES.map(cat => ({
  id: cat,
  label: cat.charAt(0).toUpperCase() + cat.slice(1)
}));

const stylePresets = [
  'Chic & Modern (Default)',
  'Minimalist Office',
  'Classy Modest',
  'Smart Casual',
  'Evening Formal',
];

const OutfitGeneratorForm: React.FC<OutfitGeneratorFormProps> = ({ onGenerate, isLoading }) => {
  const [numberOfOptions, setNumberOfOptions] = useState(3);
  const [colorTone, setColorTone] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<WardrobeCategory[]>([]);
  const [stylePreset, setStylePreset] = useState(stylePresets[0]);

  const handleComponentChange = (component: WardrobeCategory) => {
    setSelectedComponents(prev => 
      prev.includes(component) 
        ? prev.filter(c => c !== component) 
        : [...prev, component]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedComponents.length < 2) {
      alert("Please select at least 2 wardrobe components.");
      return;
    }
    onGenerate({
      numberOfOptions,
      colorTone,
      components: selectedComponents,
      stylePreset,
    });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold font-serif text-gray-800 mb-6">2. Create Your Outfit</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="numberOfOptions" className="block text-sm font-medium text-gray-700 mb-1">Number of options</label>
          <input
            type="number"
            id="numberOfOptions"
            min="1"
            max="5"
            value={numberOfOptions}
            onChange={(e) => setNumberOfOptions(parseInt(e.target.value, 10))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="colorTone" className="block text-sm font-medium text-gray-700 mb-1">Color tone</label>
          <input
            type="text"
            id="colorTone"
            value={colorTone}
            onChange={(e) => setColorTone(e.target.value)}
            placeholder="e.g., mostly white, pastel, earthy"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Selected components (choose 2-4)</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {componentOptions.map((opt) => (
              <div key={opt.id} className="flex items-center">
                <input
                  id={`component-${opt.id}`}
                  type="checkbox"
                  checked={selectedComponents.includes(opt.id)}
                  onChange={() => handleComponentChange(opt.id)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor={`component-${opt.id}`} className="ml-2 block text-sm text-gray-900">{opt.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="stylePreset" className="block text-sm font-medium text-gray-700 mb-1">Style Preset</label>
           <select
            id="stylePreset"
            value={stylePreset}
            onChange={(e) => setStylePreset(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {stylePresets.map(preset => (
              <option key={preset} value={preset}>{preset}</option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || selectedComponents.length < 2}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Generating...' : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Generate Outfits
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default OutfitGeneratorForm;
