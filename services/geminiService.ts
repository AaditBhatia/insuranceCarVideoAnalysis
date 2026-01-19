import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Re-initialize GoogleGenAI on each request to ensure the latest API key is used, 
// especially important for user-provided keys in video generation scenarios.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Robustly converts a Blob to a base64 string.
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const base64 = result.split(',')[1];
        if (base64) {
          resolve(base64);
        } else {
          reject(new Error("Failed to extract base64 data from data URL."));
        }
      } else {
        reject(new Error("FileReader result is not a string."));
      }
    };
    reader.onerror = () => reject(new Error("Error reading video file."));
    reader.readAsDataURL(blob);
  });
}

export async function analyzeVideo(videoBlob: Blob, prompt: string) {
  const ai = getAI();
  const base64Data = await blobToBase64(videoBlob);

  const systemInstruction = `
    You are a Senior Insurance Claims Adjuster and Forensic Video Analyst.
    Your goal is to produce an "Official Evidence Statement" based on provided footage.
    
    CRITICAL ANALYSIS REQUIREMENTS:
    1. LIABILITY ASSESSMENT: Identify who had the right of way. Note if any driver failed to signal, braked late, or ignored traffic signals.
    2. DAMAGE IDENTIFICATION: Specify exactly where vehicles collided (e.g., Passenger side Rear Door). Estimate severity (Minor/Moderate/Severe).
    3. ENVIRONMENTAL FACTORS: Note road surface (wet/dry), visibility (glare/fog/night), and any obstructions like trees or parked cars.
    4. FRAUD DETECTION: Check for inconsistencies in vehicle behavior that might suggest a staged incident.
    5. LOGGING: Provide a millisecond-accurate timeline of the 'Pre-Collision', 'Impact', and 'Post-Collision' phases.

    FORMAT: Use structured Markdown with bold headers for easy reading by legal teams.
  `;

  // Use gemini-3-pro-preview for complex reasoning tasks like video forensic analysis
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: videoBlob.type,
            data: base64Data,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      systemInstruction
    }
  });

  return response.text || "Analysis failed.";
}

export async function getNearbyClaimCenters(lat?: number, lng?: number) {
  const ai = getAI();
  
  // Use gemini-3-flash-preview for Maps grounding
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Find the 3 closest high-rated auto insurance claim centers and repair shops near this location.",
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: lat || 37.7749, // Default to SF if not provided
            longitude: lng || -122.4194
          }
        }
      }
    },
  });

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return chunks
    .filter((chunk: any) => chunk.maps)
    .map((chunk: any) => ({
      title: chunk.maps?.title || "Nearby Service Center",
      uri: chunk.maps?.uri || "#"
    }));
}

/**
 * Generates a video using the Veo model.
 * Handles the polling for completion and fetching the final MP4 file.
 */
export async function generateVideoWithVeo({
  prompt,
  resolution,
  aspectRatio,
  onProgress
}: {
  prompt: string;
  resolution: '720p' | '1080p';
  aspectRatio: '16:9' | '9:16';
  onProgress?: (message: string) => void;
}) {
  const ai = getAI();
  
  onProgress?.('Initiating video generation with Veo...');
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: resolution,
      aspectRatio: aspectRatio
    }
  });

  onProgress?.('Processing video request... this may take a few minutes.');
  
  // Polling for completion using the recommended 10s interval
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
    onProgress?.('Synthesizing cinematic frames... hang tight.');
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error('Video generation failed or no download URI was returned.');
  }

  // Fetch the MP4 file. An API key must be appended to the URL for authentication.
  onProgress?.('Downloading final output...');
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
