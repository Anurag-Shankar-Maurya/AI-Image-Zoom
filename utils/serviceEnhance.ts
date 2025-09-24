/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { GoogleGenAI, Modality } from "@google/genai";

const dataUrlToBase64 = (dataUrl: string): string => {
    const parts = dataUrl.split(',');
    if (parts.length > 1) {
        return parts[1];
    }
    return '';
}

export const serviceEnhance = async (croppedImageDataUrl: string, history: string[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Data = dataUrlToBase64(croppedImageDataUrl);
    const imagePart = {
        inlineData: {
            mimeType: 'image/png',
            data: base64Data,
        },
    };

    if (!history || history.length === 0) {
        console.error("Enhancement history is empty.");
        // Fallback to just returning the cropped image.
        return croppedImageDataUrl;
    }

    const context = history[history.length-1];
  
    const generationPrompt = `The provided image is a low-resolution ${context ? 'photo of ' + context : 'image'}. Please upscale the image to a high-resolution, perfectly detailed image.

**DO NOT add any elements or render outside of the provided reference image subject.** The resulting image should be a clearer, higher-resolution version of the input, and nothing more and match in shapes and colors.

However, if the content of the image can't be determined, you are free to be creative and add objects or textures to match the shapes and colors within the image.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {parts:[imagePart, {text:generationPrompt}]},
            config:{
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            }
        });

        const candidates = response.candidates;
        if (!candidates || candidates.length === 0)
          throw new Error("No candidates returned from the API.");
        const contents = candidates[0].content;
        if (!contents) throw new Error("No contents returned from the API.");
        const parts = contents.parts;
        if (!parts) throw new Error("No parts returned from the API.");


        let imageSrc = croppedImageDataUrl;

        for (const part of parts) {
          if (part.inlineData) {
            const imageData = part.inlineData.data;
            imageSrc = `data:${part.inlineData.mimeType};base64,${imageData}`;
            break;
          }
        }
        
        return imageSrc;

    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        return croppedImageDataUrl; // Return original if generation fails
    }
};