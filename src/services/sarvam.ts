export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Global reference to active audio player to allow stopping playback
let activeAudio: HTMLAudioElement | null = null;

/**
 * Call Sarvam AI OpenAI-compatible chat completions API
 */
export const callSarvamChat = async (
  messages: ChatMessage[],
  apiKey: string,
  model: string = "sarvam-105b"
): Promise<string> => {
  if (!apiKey) {
    throw new Error("Sarvam AI API key is missing. Please configure it in Settings.");
  }

  const endpoint = "https://api.sarvam.ai/v1/chat/completions";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || response.statusText || `HTTP ${response.status}`;
      throw new Error(`Sarvam AI Chat API error: ${errorMsg}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;
    if (!assistantMessage) {
      throw new Error("Received empty response from Sarvam AI Chat API.");
    }

    return assistantMessage;
  } catch (error: any) {
    console.error("Sarvam Chat Error:", error);
    throw new Error(error.message || "Network error while calling Sarvam AI.");
  }
};

/**
 * Convert text response to speech using Sarvam bulbul:v3 TTS API
 */
export const generateSarvamSpeech = async (
  text: string,
  apiKey: string,
  languageCode: string = "en-IN",
  speaker: string = "anushka"
): Promise<string> => {
  if (!apiKey) {
    throw new Error("Sarvam AI API key is missing. Speech synthesis requires an API key.");
  }

  const endpoint = "https://api.sarvam.ai/v1/text-to-speech";

  // Clean the text to remove common Markdown symbols like asterisks, backticks, hashes, etc.
  const cleanedText = text
    .replace(/[\*\_`\#]/g, "") // remove formatting symbols
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // replace markdown links with just link text
    .replace(/-\s+/g, "") // remove dashes for list items
    .substring(0, 1000); // keep text within reasonable length for synthesis

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: cleanedText,
        target_language_code: languageCode,
        speaker,
        model: "bulbul:v3",
        pace: 1.0,
        temperature: 0.6,
        speech_sample_rate: 24000
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.message || response.statusText || `HTTP ${response.status}`;
      throw new Error(`Sarvam AI TTS API error: ${errorMsg}`);
    }

    const data = await response.json();
    const base64Audio = data.audios?.[0];
    if (!base64Audio) {
      throw new Error("No audio returned from Sarvam AI TTS API.");
    }

    return base64Audio;
  } catch (error: any) {
    console.error("Sarvam TTS Error:", error);
    throw new Error(error.message || "Failed to generate speech audio.");
  }
};

/**
 * Play base64 MP3 audio using the HTML5 Audio interface
 */
export const playAudioResponse = (base64Audio: string, onEnded?: () => void): HTMLAudioElement | null => {
  stopAudioResponse();

  try {
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
    activeAudio = new Audio(audioUrl);
    activeAudio.onended = () => {
      activeAudio = null;
      if (onEnded) onEnded();
    };
    activeAudio.onerror = () => {
      console.error("Error playing audio source");
      activeAudio = null;
      if (onEnded) onEnded();
    };
    activeAudio.play();
    return activeAudio;
  } catch (error) {
    console.error("Failed to play audio:", error);
    if (onEnded) onEnded();
    return null;
  }
};

/**
 * Stop any ongoing audio playback
 */
export const stopAudioResponse = (): void => {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
};

/**
 * Check if audio is currently playing
 */
export const isAudioPlaying = (): boolean => {
  return activeAudio !== null;
};

/**
 * Transcribe recorded speech to text using Sarvam's Speech-to-Text API
 */
export const transcribeSarvamSpeech = async (
  audioBlob: Blob,
  apiKey: string,
  languageCode: string = "en-IN"
): Promise<string> => {
  if (!apiKey) {
    throw new Error("Sarvam AI API key is missing. Speech-to-text requires an API key.");
  }

  const endpoint = "https://api.sarvam.ai/speech-to-text";
  
  const formData = new FormData();
  formData.append("file", audioBlob, "input.wav");
  formData.append("model", "saaras:v3");
  
  if (languageCode && languageCode !== "unknown") {
    formData.append("language_code", languageCode);
  }
  
  formData.append("mode", "transcribe");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.message || response.statusText || `HTTP ${response.status}`;
      throw new Error(`Sarvam AI STT API error: ${errorMsg}`);
    }

    const data = await response.json();
    const transcript = data.transcript;
    if (transcript === undefined || transcript === null) {
      throw new Error("No transcription text returned from the API.");
    }

    return transcript;
  } catch (error: any) {
    console.error("Sarvam STT Error:", error);
    throw new Error(error.message || "Failed to transcribe audio.");
  }
};
