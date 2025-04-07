
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// This is a basic mock translation service
// In a real app, you would use a service like Google Translate API
serve(async (req) => {
  try {
    const { text, targetLang, sourceLang } = await req.json();
    
    if (!text) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    if (!targetLang) {
      return new Response(
        JSON.stringify({ error: "Target language is required" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Mock translation - in a real app, call an actual translation API
    const detectedLang = detectMockLanguage(text);
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
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Mock language detection
function detectMockLanguage(text: string): string {
  if (text.includes("Hola") || text.includes("¿cómo estás")) return "es";
  if (text.includes("Bonjour") || text.includes("Comment ça va")) return "fr";
  if (text.includes("こんにちは") || text.includes("お元気")) return "ja";
  if (text.includes("Guten") || text.includes("Wie geht")) return "de";
  return "en";
}

// Mock translation generator
function generateMockTranslation(text: string, targetLang: string, sourceLang: string): string {
  // In a real app, this would call a translation service
  const mockTranslations: Record<string, Record<string, string>> = {
    en: {
      es: "Hola, ¿cómo estás?",
      fr: "Bonjour, comment ça va?",
      de: "Hallo, wie geht es dir?",
      ja: "こんにちは、お元気ですか？"
    },
    es: {
      en: "Hello, how are you?",
      fr: "Bonjour, comment ça va?",
      de: "Hallo, wie geht es dir?",
      ja: "こんにちは、お元気ですか？"
    },
    fr: {
      en: "Hello, how are you?",
      es: "Hola, ¿cómo estás?",
      de: "Hallo, wie geht es dir?",
      ja: "こんにちは、お元気ですか？"
    }
  };
  
  if (mockTranslations[sourceLang]?.[targetLang]) {
    return mockTranslations[sourceLang][targetLang];
  }
  
  return `[Translation from ${sourceLang} to ${targetLang}: ${text}]`;
}
