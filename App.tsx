import React, { useState, useCallback, useEffect } from 'react';
import { WardrobeItem, Wardrobe, OutfitRequest, GeneratedOutfit, WardrobeCategory } from './types';
import { generateOutfits } from './services/geminiService';
import Header from './components/Header';
import WardrobeUploader from './components/WardrobeUploader';
import OutfitGeneratorForm from './components/OutfitGeneratorForm';
import GeneratedOutfits from './components/GeneratedOutfits';
import { Toaster, toast } from 'react-hot-toast';

const WARDROBE_STORAGE_KEY = 'ai-outfit-stylist-wardrobe';

const App: React.FC = () => {
  const [wardrobe, setWardrobe] = useState<Wardrobe>(() => {
    try {
      const storedWardrobe = window.localStorage.getItem(WARDROBE_STORAGE_KEY);
      if (storedWardrobe) {
        return JSON.parse(storedWardrobe);
      }
    } catch (error) {
      console.error("Failed to parse wardrobe from localStorage", error);
    }
    return {
      tops: [],
      bottoms: [],
      dresses: [],
      hijabs: [],
      shoes: [],
      bags: [],
      accessories: [],
    };
  });
  const [generatedOutfits, setGeneratedOutfits] = useState<GeneratedOutfit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastRequest, setLastRequest] = useState<OutfitRequest | null>(null);


  useEffect(() => {
    try {
      window.localStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(wardrobe));
    } catch (error) {
      console.error("Failed to save wardrobe to localStorage", error);
      toast.error("Could not save your wardrobe. Your browser storage might be full.");
    }
  }, [wardrobe]);

  const handleWardrobeUpdate = useCallback((category: WardrobeCategory, items: WardrobeItem[]) => {
    setWardrobe(prev => ({ ...prev, [category]: [...prev[category], ...items] }));
  }, []);

  const handleWardrobeItemDelete = useCallback((category: WardrobeCategory, index: number) => {
    setWardrobe(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  }, []);

  const handleOutfitUpdate = useCallback((index: number, newOutfit: GeneratedOutfit) => {
    setGeneratedOutfits(prev => {
      const updatedOutfits = [...prev];
      updatedOutfits[index] = newOutfit;
      return updatedOutfits;
    });
  }, []);

  const handleGenerateOutfits = async (request: OutfitRequest) => {
    for (const category of request.components) {
      if (wardrobe[category].length === 0) {
        toast.error(`Please upload at least one item for the '${category}' category.`);
        return;
      }
    }

    setIsLoading(true);
    setGeneratedOutfits([]);
    setLastRequest(request); 
    try {
      const outfits = await generateOutfits(request, wardrobe);
      setGeneratedOutfits(outfits);
      if (outfits.length === 0) {
        toast.success("Generated all possible unique outfits for now. Try different options!");
      }
    } catch (error) {
      console.error("Outfit generation failed:", error);
      toast.error("An error occurred while generating outfits. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMoreOutfits = async () => {
    if (!lastRequest) {
      toast.error("Please generate an initial set of outfits first.");
      return;
    }
    
    setIsLoading(true);
    try {
      // Pass existing outfits to avoid duplicates
      const newOutfits = await generateOutfits(lastRequest, wardrobe, generatedOutfits);
      if (newOutfits.length > 0) {
        setGeneratedOutfits(prev => [...prev, ...newOutfits]);
        toast.success(`Added ${newOutfits.length} new outfits!`);
      } else {
        toast.success("No more unique combinations could be generated with the current settings.");
      }
    } catch (error) {
      console.error("Failed to generate more outfits:", error);
      toast.error("An error occurred while generating more outfits.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Toaster position="top-center" reverseOrder={false} />
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 xl:col-span-4 space-y-8">
            <WardrobeUploader
              wardrobe={wardrobe}
              onWardrobeUpdate={handleWardrobeUpdate}
              onItemDelete={handleWardrobeItemDelete}
            />
            <OutfitGeneratorForm onGenerate={handleGenerateOutfits} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-7 xl:col-span-8">
            <GeneratedOutfits
              wardrobe={wardrobe}
              outfits={generatedOutfits}
              isLoading={isLoading}
              onOutfitUpdate={handleOutfitUpdate}
              onGenerateMore={handleGenerateMoreOutfits}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;