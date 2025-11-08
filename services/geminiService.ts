
import { GoogleGenAI, Modality } from "@google/genai";
import { OutfitRequest, Wardrobe, GeneratedOutfit, EditOutfitRequest } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const editOutfit = async (
  baseOutfit: GeneratedOutfit,
  request: EditOutfitRequest
): Promise<GeneratedOutfit> => {
    const imagePromptParts: any[] = [];
    
    let textPrompt = '';
    const targetDescription = `the ${request.layer} layer ${request.category}`;
    
    if (request.action === 'change') {
      textPrompt = `You are an AI Fashion Image Editor. Your task is to replace a specific clothing layer in a base image with a new item from the user's wardrobe, while keeping all other visual elements identical. After the replacement, ensure the resulting outfit remains stylistically coherent and visually appealing, following principles of color harmony and silhouette balance.

--- CRITICAL CONSTRAINTS ---

1.  **Targeted Replacement:** You MUST replace **${targetDescription}** in the "Base Image to Edit" with the item shown in the "Replacement Item" image.
2.  **Preserve Everything Else:** You MUST preserve all other elements from the original "Base Image to Edit":
    *   **Model:** The model's body, pose, face, proportions, and skin tone must remain unchanged.
    *   **Unchanged Clothing:** Any clothing item or layer that is NOT the target must be identical in shape, fabric, texture, color, and lighting.
    *   **Background & Lighting:** The background and overall lighting conditions must be identical.
3.  **Use Wardrobe Item Exactly:** The new ${request.category} in the output image must look exactly like the "Replacement Item" provided (same shape, color, pattern, texture). Do not alter or redesign it.
4.  **Realism:** The final image must be photorealistic and look like a natural, seamless photograph. Avoid "AI-art" textures.

--- IMAGES ---

**Base Image to Edit:**`;
    } else { // action === 'take_out'
        textPrompt = `You are an AI Fashion Image Editor. Your task is to remove a specific clothing layer from a base image, while keeping all other visual elements identical. After the removal, ensure the resulting outfit remains stylistically coherent and visually appealing, for example by ensuring the newly revealed layer underneath works well with the rest of the outfit.

--- CRITICAL CONSTRAINTS ---

1.  **Targeted Removal:** You MUST remove **${targetDescription}** from the "Base Image to Edit".
2.  **Natural Fill:** You MUST fill the area where the item was removed naturally, creating realistic contours and shading on the layer that would be underneath.
3.  **Preserve Everything Else:** You MUST preserve all other elements from the original "Base Image to Edit":
    *   **Model:** The model's body, pose, face, proportions, and skin tone must remain unchanged.
    *   **Unchanged Clothing:** All other clothing items and layers must be identical in shape, fabric, texture, color, and lighting.
    *   **Background & Lighting:** The background and overall lighting conditions must be identical.
4.  **Realism:** The final image must be photorealistic and look like a natural, seamless photograph. Avoid "AI-art" textures.

--- IMAGE ---

**Base Image to Edit:**`;
    }

    imagePromptParts.push({ text: textPrompt });
    
    // Add base image
    const baseImageMimeType = baseOutfit.image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    const baseImageBase64 = baseOutfit.image.split(',')[1];
    imagePromptParts.push(fileToGenerativePart(baseImageBase64, baseImageMimeType));
    
    // Add replacement item image only for 'change' action
    if (request.action === 'change' && request.replacementItem) {
        imagePromptParts.push({ text: `\n**Replacement Item (New ${request.category}):**` });
        const replacementItemMimeType = request.replacementItem.base64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
        const replacementItemBase64 = request.replacementItem.base64.split(',')[1];
        imagePromptParts.push(fileToGenerativePart(replacementItemBase64, replacementItemMimeType));
    }

    const imageResult = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: imagePromptParts },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    let generatedImageBase64 = '';
    if (imageResult.candidates?.[0]?.content?.parts) {
      for (const part of imageResult.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImageBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!generatedImageBase64) {
      throw new Error("Image editing failed to return an image.");
    }
    
    const imageSrc = `data:image/png;base64,${generatedImageBase64}`;

    return {
      image: imageSrc,
      title: baseOutfit.title, // Preserve original title as per new requirement
    };
};


export const generateOutfits = async (
  request: OutfitRequest,
  wardrobe: Wardrobe,
  existingOutfits: GeneratedOutfit[] = []
): Promise<GeneratedOutfit[]> => {
  const generatedOutfits: GeneratedOutfit[] = [];
  
  const startIndex = existingOutfits.length;

  for (let i = 0; i < request.numberOfOptions; i++) {
    try {
      const imagePromptParts: any[] = [];
      
      let textPrompt = `You are an AI Outfit Stylist. Your mission is to create realistic, stylish, and coherent outfit recommendations based on professional styling principles and the user's actual wardrobe photos.

--- Generation Logic & Constraints ---

1.  **Use Identical Visuals (CRITICAL):**
    *   You MUST use the identical visual references from the wardrobe images provided. This means the **same shape, pattern, and texture.**
    *   **DO NOT REDESIGN OR ALTER** the clothing items. Your job is to composite the existing items realistically onto a model, not to invent new ones. The final image must look like a real photo of the user's clothes.

2.  **Unique & Varied Options:**
    *   For this specific request (Option #${i + 1}), create a combination that is unique. **AVOID REPETITION.** Do not use the same core combination of items that you have used for other options in this session.`;

      if (existingOutfits.length > 0) {
        textPrompt += `\n    *   **IMPORTANT**: You have already generated some outfits. Here they are. DO NOT generate these exact combinations again. You must create something new.`;
      }

      textPrompt += `
--- Professional Styling Principles (CRITICAL) ---

You must adhere to the following rules to ensure the generated outfits are fashionable and well-put-together. The user has selected the style preset: "${request.stylePreset}". This preset should strongly guide your choices.

*   **Palette Discipline:** Stick to a maximum of 3 colors per outfit. Apply the 60-30-10 rule where possible (60% dominant color, 30% secondary, 10% accent). The user's preferred color tone is "${request.colorTone}". This is a hint, but the preset and harmony rules are more important.
*   **Color Harmony:** Prioritize harmonious color palettes:
    *   **Neutral + Accent:** Combine neutral colors (like white, beige, gray, navy, black) with one pop of color.
    *   **Analogous:** Use colors that are next to each other on the color wheel.
    *   **Soft Complementary:** Use colors opposite each other on the color wheel, but in softer, less saturated tones.
    *   Avoid clashing combinations like bright red with bright green.
*   **Silhouette Balance:** Create a visually balanced silhouette by pairing fitted items with relaxed/wider items. For example:
    *   Fitted top with wide-leg pants.
    *   Relaxed blouse with skinny jeans or a pencil skirt.
    *   **CRITICAL:** Avoid pairing two oversized or very bulky items together.
*   **Pattern & Texture Sanity:**
    *   **Max One Pattern:** Use a maximum of one patterned piece per outfit. All other pieces should be solid colors.
    *   If a patterned hijab is used, the top and bottom must be solid.
    *   You can mix textures (e.g., denim and a knit sweater), but avoid overwhelming combinations.
*   **Layering Logic:** Layers must be logical. Inner layers should be lighter/thinner than outer layers (e.g., a t-shirt under a jacket).
*   **Accessory Coherence:** Ensure all metallic accessories (jewelry, bag hardware, etc.) are a consistent color (e.g., all gold-toned or all silver-toned).
*   **Modest Wear Specifics (If Hijab is selected):** The hijab's color should anchor to the dominant or secondary color of the outfit for a cohesive look.

--- Final Image Output ---

*   Generate a single, full-body image of a female figure in a neutral standing pose.
*   The background must be clean and simple (e.g., light gray studio background) to keep the focus on the outfit.
*   The output must be a single, photorealistic image with no text.

--- User's Wardrobe for this Task ---`;

      imagePromptParts.push({ text: textPrompt });
      
      // Add existing outfits for context to avoid duplicates
      if (existingOutfits.length > 0) {
        imagePromptParts.push({ text: `\n**Previously Generated Outfits (for reference, do not copy):**` });
        for (const outfit of existingOutfits) {
            const mimeType = outfit.image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
            const base64Data = outfit.image.split(',')[1];
            imagePromptParts.push(fileToGenerativePart(base64Data, mimeType));
        }
      }

      // Pass all items from selected categories to the model
      for (const category of request.components) {
        if (wardrobe[category].length > 0) {
          imagePromptParts.push({ text: `\n**Available ${category}:**` });
          for (const item of wardrobe[category]) {
            const mimeType = item.base64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
            const base64Data = item.base64.split(',')[1];
            imagePromptParts.push(fileToGenerativePart(base64Data, mimeType));
          }
        }
      }

      const imageResult = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: imagePromptParts },
        config: {
            responseModalities: [Modality.IMAGE],
        },
      });

      let generatedImageBase64 = '';
      if (imageResult.candidates?.[0]?.content?.parts) {
        for (const part of imageResult.candidates[0].content.parts) {
          if (part.inlineData) {
            generatedImageBase64 = part.inlineData.data;
            break;
          }
        }
      }

      if (!generatedImageBase64) {
        console.warn("Image generation did not return an image for one of the options.");
        continue;
      }
      
      const imageSrc = `data:image/png;base64,${generatedImageBase64}`;

      generatedOutfits.push({
        image: imageSrc,
        title: `Opsi ${startIndex + i + 1}`,
      });

    } catch (error) {
      console.error(`Error generating outfit option ${i + 1}:`, error);
      // Continue to next iteration
    }
  }

  return generatedOutfits;
};
