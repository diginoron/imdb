// The @google/genai SDK is no longer used for this direct API call.
// import { GoogleGenAI } from "@google/genai";

// این تابع در سمت سرور Vercel اجرا می‌شود، نه در مرورگر کاربر.
// This function runs on the Vercel server, not in the user's browser.
export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // در اینجا به صورت امن به کلید API دسترسی داریم
    // Securely access the API key here
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set");
    }

    const model = 'gemini-2.5-flash';
    // The Gemini REST API endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    // The request payload for the REST API
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    // Make a direct fetch call to the Google Gemini REST API
    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error("Error from Gemini API:", errorData);
        // Provide a more specific error message from the API if available
        throw new Error(errorData.error?.message || 'Gemini API request failed');
    }

    const responseData = await apiResponse.json();
    
    // Extract the text from the REST API response structure
    const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return new Response(JSON.stringify({ text: text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in Gemini API route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: "Failed to get AI response", details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
