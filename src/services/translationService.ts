
import { Language, SUPPORTED_LANGUAGES } from "@/types";

// In a real app, this would use the Google Translate API
// Here we're mocking it for demonstration purposes

interface TranslationResponse {
  translatedText: string;
  detectedLanguage?: string;
}

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<TranslationResponse> {
  console.log(`Translating "${text}" to ${targetLanguage} from ${sourceLanguage || "auto"}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));

  // Mock translation for demo purposes
  // In a real app, this would call the Google Translate API
  const mockTranslations: Record<string, Record<string, string>> = {
    en: {
      es: "Hola, ¿cómo estás?",
      fr: "Bonjour, comment ça va?",
      ja: "こんにちは、お元気ですか？",
      de: "Hallo, wie geht es dir?"
    },
    es: {
      en: "Hello, how are you?",
      fr: "Bonjour, comment ça va?",
      ja: "こんにちは、お元気ですか？",
      de: "Hallo, wie geht es dir?"
    },
    fr: {
      en: "Hello, how are you?",
      es: "Hola, ¿cómo estás?",
      ja: "こんにちは、お元気ですか？",
      de: "Hallo, wie geht es dir?"
    },
    ja: {
      en: "Hello, how are you?",
      es: "Hola, ¿cómo estás?",
      fr: "Bonjour, comment ça va?",
      de: "Hallo, wie geht es dir?"
    }
  };
  
  // If we don't have a mock translation for this language pair,
  // just return the original text with a note
  if (!sourceLanguage) {
    // Auto-detect language mock
    const detectedLang = text.includes("Hola") ? "es" : 
                        text.includes("Bonjour") ? "fr" :
                        text.includes("こんにちは") ? "ja" : "en";
    
    sourceLanguage = detectedLang;
  }
  
  let translatedText = text;
  
  // Try to use our mock translations
  if (sourceLanguage !== targetLanguage) {
    if (mockTranslations[sourceLanguage]?.[targetLanguage]) {
      translatedText = mockTranslations[sourceLanguage][targetLanguage];
    } else {
      // Create a realistic-looking translation placeholder
      translatedText = `[Translation of: "${text}" from ${getLanguageName(sourceLanguage)} to ${getLanguageName(targetLanguage)}]`;
    }
  }
  
  return {
    translatedText,
    detectedLanguage: sourceLanguage
  };
}

export function detectLanguage(text: string): Promise<string> {
  // In a real app, this would call the Google Translate API to detect the language
  // Mocking the behavior for demo purposes
  return new Promise(resolve => {
    setTimeout(() => {
      if (text.includes("Hola") || text.includes("¿")) {
        resolve("es");
      } else if (text.includes("Bonjour") || text.includes("ça va")) {
        resolve("fr");
      } else if (text.includes("こんにちは") || text.includes("お元気")) {
        resolve("ja");
      } else {
        resolve("en");
      }
    }, 300);
  });
}

export function getLanguageName(code: string): string {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  return language ? language.name : code;
}
