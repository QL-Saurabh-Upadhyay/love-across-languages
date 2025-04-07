
import { Language, SUPPORTED_LANGUAGES } from "@/types";
import { supabase } from '@/integrations/supabase/client';

interface TranslationResponse {
  translatedText: string;
  detectedLanguage?: string;
}

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<TranslationResponse> {
  try {
    console.log(`Translating text to ${targetLanguage}...`);
    
    const { data, error } = await supabase.functions.invoke('translate', {
      body: {
        text,
        targetLang: targetLanguage,
        sourceLang: sourceLanguage
      }
    });
    
    if (error) {
      console.error("Translation API error:", error);
      throw error;
    }
    
    console.log("Translation successful:", data);
    
    return {
      translatedText: data.translatedText,
      detectedLanguage: data.detectedLanguage
    };
  } catch (error) {
    console.error("Translation service error:", error);
    return {
      translatedText: text,
      detectedLanguage: sourceLanguage
    };
  }
}

export async function detectLanguage(text: string): Promise<string> {
  try {
    console.log("Detecting language...");
    
    const { data, error } = await supabase.functions.invoke('translate', {
      body: {
        text,
        targetLang: 'en', // Doesn't matter for detection
        detectOnly: true
      }
    });
    
    if (error) {
      console.error("Language detection API error:", error);
      throw error;
    }
    
    console.log("Language detection successful:", data.detectedLanguage);
    
    return data.detectedLanguage || 'en';
  } catch (error) {
    console.error("Language detection service error:", error);
    return 'en';
  }
}

export function getLanguageName(code: string): string {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  return language ? language.name : code;
}
