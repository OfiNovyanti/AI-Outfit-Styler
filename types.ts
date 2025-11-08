export interface WardrobeItem {
  name: string;
  base64: string;
}

export const WARDROBE_CATEGORIES = ['tops', 'bottoms', 'dresses', 'hijabs', 'shoes', 'bags', 'accessories'] as const;
export type WardrobeCategory = typeof WARDROBE_CATEGORIES[number];

export type Wardrobe = {
  [key in WardrobeCategory]: WardrobeItem[];
};

export interface OutfitRequest {
  numberOfOptions: number;
  colorTone: string;
  components: WardrobeCategory[];
  stylePreset: string;
}

export interface GeneratedOutfit {
  image: string;
  title: string;
}

export interface EditOutfitRequest {
  action: 'change' | 'take_out';
  category: WardrobeCategory;
  layer: string; // e.g., 'inner', 'outer', 'base'
  replacementItem?: WardrobeItem;
}
