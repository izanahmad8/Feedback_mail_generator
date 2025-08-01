import { useEffect, useState } from "react";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function analyzeFeedbackWithGemini(feedback) {
  if (!feedback) return null;
  const prompt = `Analyze the following feedback and classify the quality as one of: Very Bad, Bad, Neutral, Good, Very Good. Explain the reasoning concisely in a sentence. Return JSON with keys Quality and Reason.

Feedback: "${feedback}"`;

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Extract JSON from code block if present
    const match =
      aiText.match(/```json\s*([\s\S]*?)```/i) ||
      aiText.match(/```([\s\S]*?)```/);
    let jsonStr = aiText;
    if (match) {
      jsonStr = match[1];
    }
    try {
      const aiJson = JSON.parse(jsonStr);
      return aiJson;
    } catch {
      return { Quality: "Unknown", Reason: "AI did not return valid JSON." };
    }
  } catch {
    return { Quality: "Unknown", Reason: "Error calling Gemini API." };
  }
}

// // Only calls onResult with the result; no UI here.
// export default function Gemini({ feedback, onResult }) {
//   useEffect(() => {
//     let cancelled = false;
//     async function fetchAnalysis() {
//       if (feedback) {
//         const res = await analyzeFeedbackWithGemini(feedback);
//         if (!cancelled && onResult) onResult(res);
//       } else if (onResult) {
//         onResult(null);
//       }
//     }
//     fetchAnalysis();
//     return () => { cancelled = true; };
//   }, [feedback, onResult]);

//   return null; 
// }
