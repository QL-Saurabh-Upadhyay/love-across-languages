
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
    const { data, error } = await supabase.functions.invoke('translate', {
      body: {
        text,
        targetLang: targetLanguage,
        sourceLang: sourceLanguage
      }
    });
    
    if (error) throw error;
    
    return {
      translatedText: data.translatedText,
      detectedLanguage: data.detectedLanguage
    };
  } catch (error) {
    console.error("Translation error:", error);
    return {
      translatedText: `[Translation error: ${text}]`,
      detectedLanguage: sourceLanguage
    };
  }
}

export async function detectLanguage(text: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('translate', {
      body: {
        text,
        targetLang: 'en', // Doesn't matter for detection
        detectOnly: true
      }
    });
    
    if (error) throw error;
    
    return data.detectedLanguage || 'en';
  } catch (error) {
    console.error("Language detection error:", error);
    return 'en';
  }
}

export function getLanguageName(code: string): string {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  return language ? language.name : code;
}
