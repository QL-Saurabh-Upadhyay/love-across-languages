
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLang, sourceLang, detectOnly } = await req.json();
    
    if (!text) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Just detect the language without translation
    if (detectOnly) {
      const detectedLang = detectMockLanguage(text);
      return new Response(
        JSON.stringify({
          detectedLanguage: detectedLang
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!targetLang) {
      return new Response(
        JSON.stringify({ error: "Target language is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Mock translation - in a real app, call an actual translation API
    const detectedLang = sourceLang || detectMockLanguage(text);
    let translatedText = text;
    
    // If source and target languages are different, mock a translation
    if (detectedLang !== targetLang) {
      translatedText = generateMockTranslation(text, targetLang, detectedLang);
    }
    
    return new Response(
      JSON.stringify({
        translatedText,
        detectedLanguage: detectedLang
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Translation function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Improved mock language detection
function detectMockLanguage(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Spanish detection
  if (
    lowerText.includes("hola") || 
    lowerText.includes("cómo estás") || 
    lowerText.includes("gracias") || 
    lowerText.includes("buenos días") ||
    /[áéíóúñ¿¡]/.test(lowerText)
  ) return "es";
  
  // French detection
  if (
    lowerText.includes("bonjour") || 
    lowerText.includes("comment ça va") || 
    lowerText.includes("merci") || 
    lowerText.includes("s'il vous plaît") ||
    /[àâçéèêëîïôùûüÿ]/.test(lowerText)
  ) return "fr";
  
  // Japanese detection
  if (
    lowerText.includes("こんにちは") || 
    lowerText.includes("お元気") || 
    lowerText.includes("ありがとう") ||
    /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(lowerText)
  ) return "ja";
  
  // German detection
  if (
    lowerText.includes("guten") || 
    lowerText.includes("wie geht") || 
    lowerText.includes("danke") || 
    lowerText.includes("bitte") ||
    /[äöüß]/.test(lowerText)
  ) return "de";
  
  // Default to English for everything else
  return "en";
}

// Mock translation generator with better examples
function generateMockTranslation(text: string, targetLang: string, sourceLang: string): string {
  // In a real app, this would call a translation service
  // Here we just provide some mock translations for demonstration purposes
  
  // Simple word-based mock translations
  const mockDict: Record<string, Record<string, string>> = {
    "hello": {
      "en": "hello",
      "es": "hola",
      "fr": "bonjour",
      "de": "hallo",
      "ja": "こんにちは"
    },
    "how are you": {
      "en": "how are you",
      "es": "¿cómo estás?",
      "fr": "comment ça va?",
      "de": "wie geht es dir?",
      "ja": "お元気ですか？"
    },
    "thank you": {
      "en": "thank you",
      "es": "gracias",
      "fr": "merci",
      "de": "danke",
      "ja": "ありがとう"
    },
    "goodbye": {
      "en": "goodbye",
      "es": "adiós",
      "fr": "au revoir",
      "de": "auf wiedersehen",
      "ja": "さようなら"
    },
    "yes": {
      "en": "yes",
      "es": "sí",
      "fr": "oui",
      "de": "ja",
      "ja": "はい"
    },
    "no": {
      "en": "no",
      "es": "no",
      "fr": "non",
      "de": "nein",
      "ja": "いいえ"
    }
  };
  
  // Check if the text matches any of our dictionary entries
  const lowerText = text.toLowerCase();
  for (const [key, translations] of Object.entries(mockDict)) {
    if (lowerText.includes(key)) {
      if (translations[targetLang]) {
        // Replace the key phrase with the translation
        const regex = new RegExp(key, 'i');
        return text.replace(regex, translations[targetLang]);
      }
    }
  }
  
  // If no direct match, use our fallback sample translations
  const mockTranslations: Record<string, Record<string, string>> = {
    en: {
      es: "Este es un mensaje traducido automáticamente del inglés al español.",
      fr: "Ceci est un message traduit automatiquement de l'anglais vers le français.",
      de: "Dies ist eine automatisch übersetzte Nachricht von Englisch nach Deutsch.",
      ja: "これは英語から日本語に自動翻訳されたメッセージです。"
    },
    es: {
      en: "This is an automatically translated message from Spanish to English.",
      fr: "Ceci est un message traduit automatiquement de l'espagnol vers le français.",
      de: "Dies ist eine automatisch übersetzte Nachricht von Spanisch nach Deutsch.",
      ja: "これはスペイン語から日本語に自動翻訳されたメッセージです。"
    },
    fr: {
      en: "This is an automatically translated message from French to English.",
      es: "Este es un mensaje traducido automáticamente del francés al español.",
      de: "Dies ist eine automatisch übersetzte Nachricht von Französisch nach Deutsch.",
      ja: "これはフランス語から日本語に自動翻訳されたメッセージです。"
    },
    de: {
      en: "This is an automatically translated message from German to English.",
      es: "Este es un mensaje traducido automáticamente del alemán al español.",
      fr: "Ceci est un message traduit automatiquement de l'allemand vers le français.",
      ja: "これはドイツ語から日本語に自動翻訳されたメッセージです。"
    },
    ja: {
      en: "This is an automatically translated message from Japanese to English.",
      es: "Este es un mensaje traducido automáticamente del japonés al español.",
      fr: "Ceci est un message traduit automatiquement du japonais vers le français.",
      de: "Dies ist eine automatisch übersetzte Nachricht von Japanisch nach Deutsch."
    }
  };
  
  if (mockTranslations[sourceLang]?.[targetLang]) {
    return `[${mockTranslations[sourceLang][targetLang]}] ${text}`;
  }
  
  return `[Translation from ${sourceLang} to ${targetLang}] ${text}`;
}
