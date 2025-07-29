import { useEffect, useState } from "react";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

async function analyzeFeedbackWithGemini(feedback) {
  if (!feedback) return null;
  const prompt = `Analyze the following feedback and classify the quality as one of: Very Bad, Bad, Neutral, Good, Very Good. Explain the reasoning concisely in a sentence. Return JSON with keys Quality and Reason.

Feedback: "${feedback}"`;

  // CORRECTED ENDPOINT!
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

export default function GeminiFeedbackAnalysis({ feedback }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchAnalysis() {
      setLoading(true);
      setResult(null);
      if (feedback) {
        const res = await analyzeFeedbackWithGemini(feedback);
        if (!cancelled) setResult(res);
      }
      setLoading(false);
    }
    fetchAnalysis();
    return () => {
      cancelled = true;
    };
  }, [feedback]);

  if (!feedback) return null;
  if (loading)
    return (
      <div className="text-blue-600 font-semibold mt-4">
        Gemini AI analyzing feedback...
      </div>
    );
  if (result)
    return (
      <div className="mt-4 p-3 rounded-lg border bg-blue-50 text-blue-900 text-sm">
        <strong>Gemini AI Feedback Analysis:</strong>
        <pre className="mt-2 break-words whitespace-pre-wrap">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  return null;
}
