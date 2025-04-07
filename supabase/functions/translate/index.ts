
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This is a dummy key - you'll need to replace it with a real one
const GOOGLE_TRANSLATE_API_KEY = "DUMMY_GOOGLE_TRANSLATE_API_KEY";

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
    
    // Detection-only request
    if (detectOnly) {
      try {
        const detectedLang = await detectLanguage(text);
        return new Response(
          JSON.stringify({ 
            detectedLanguage: detectedLang 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Language detection error:", error);
        return new Response(
          JSON.stringify({ 
            error: "Language detection failed",
            detectedLanguage: "en" // Fallback to English
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
    }
    
    if (!targetLang) {
      return new Response(
        JSON.stringify({ error: "Target language is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Determine source language if not provided
    let sourceLanguage = sourceLang;
    if (!sourceLanguage) {
      try {
        sourceLanguage = await detectLanguage(text);
      } catch (error) {
        console.error("Auto-detection failed:", error);
        // Default to English if detection fails
        sourceLanguage = "en";
      }
    }
    
    // If source and target languages are the same, no need to translate
    if (sourceLanguage === targetLang) {
      return new Response(
        JSON.stringify({
          translatedText: text,
          detectedLanguage: sourceLanguage
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Perform the translation
    try {
      const translatedText = await translateText(text, targetLang, sourceLanguage);
      return new Response(
        JSON.stringify({
          translatedText,
          detectedLanguage: sourceLanguage
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Translation error:", error);
      return new Response(
        JSON.stringify({ 
          error: "Translation failed", 
          translatedText: text,
          detectedLanguage: sourceLanguage
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } catch (error) {
    console.error("Translation function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Language detection using Google Translate API
async function detectLanguage(text: string): Promise<string> {
  try {
    const url = `https://translation.googleapis.com/language/translate/v2/detect?key=${GOOGLE_TRANSLATE_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google API error:", errorData);
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle the response structure from Google's API
    if (data && 
        data.data && 
        data.data.detections && 
        data.data.detections.length > 0 && 
        data.data.detections[0].length > 0) {
      return data.data.detections[0][0].language;
    }
    
    throw new Error("Unexpected API response structure");
  } catch (error) {
    console.error("Language detection error:", error);
    // Default to English on error
    return "en";
  }
}

// Text translation using Google Translate API
async function translateText(text: string, targetLang: string, sourceLang: string): Promise<string> {
  try {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
    const body: Record<string, any> = {
      q: text,
      target: targetLang
    };
    
    // Only add source language if it's provided and not auto
    if (sourceLang && sourceLang !== 'auto') {
      body.source = sourceLang;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google API error:", errorData);
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle the response structure from Google's API
    if (data && 
        data.data && 
        data.data.translations && 
        data.data.translations.length > 0) {
      return data.data.translations[0].translatedText;
    }
    
    throw new Error("Unexpected API response structure");
  } catch (error) {
    console.error("Translation error:", error);
    // Return the original text if translation fails
    return text;
  }
}
