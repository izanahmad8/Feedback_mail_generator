import { useState, useRef } from "react";
import { Analytics } from "@vercel/analytics/react";
import toast, { Toaster } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import {analyzeFeedbackWithGemini} from "./Gemini";
import FeedbackQualityMeter from "./FeedbackQualityMeter";

const formats = [
  {
    name: "Interview",
    fields: [
      {
        key: "taskStatus",
        label: "Task Status",
        type: "select",
        options: ["Completed", "Cancelled", "Rescheduled", "Not Done"],
      },
      {
        key: "interviewRound",
        label: "Interview Round",
        type: "select",
        options: [
          "Screening",
          "1st",
          "2nd",
          "Technical",
          "Managerial",
          "Final",
          "HR",
          "Loop",
        ],
      },
      { key: "feedback", label: "Feedback", type: "textarea" },
      {
        key: "questions",
        label: "Interview Questions Asked",
        type: "textarea",
      },
    ],
  },
  {
    name: "Mock Interview",
    fields: [
      {
        key: "taskStatus",
        label: "Task Status",
        type: "select",
        options: ["Completed", "Not Done", "Cancelled"],
      },
      { key: "feedback", label: "Feedback", type: "textarea" },
      { key: "questions", label: "Mock Interview Questions", type: "textarea" },
    ],
  },
  {
    name: "Resume Understanding",
    fields: [
      {
        key: "taskStatus",
        label: "Task Status",
        type: "select",
        options: ["Completed", "Not Done", "Cancelled"],
      },
      { key: "feedback", label: "Feedback", type: "textarea" },
    ],
  },
  {
    name: "Assessment",
    fields: [
      {
        key: "taskStatus",
        label: "Task Status",
        type: "select",
        options: ["Completed", "Not Done", "Cancelled"],
      },
      {
        key: "assessmentType",
        label: "Assessment Type",
        type: "select",
        options: ["Behavioral", "Technical"],
      },
      { key: "feedback", label: "Feedback", type: "textarea" },
    ],
  },
];

function formatOutput(selected, values) {
  switch (selected) {
    case "Interview":
      return `**Task Status:** ${values.taskStatus || ""}  
**Interview Round:** ${values.interviewRound || ""}  
**Feedback:**  
${values.feedback || ""}  

**Interview Questions Asked:**  
${values.questions
  ?.split("\n")
  .map((q, i) => (q.trim() ? `${i + 1}. ${q.trim()}` : ""))
  .join("\n")}`;
    case "Mock Interview":
      return `**Task Status:** ${values.taskStatus || ""}  
**Feedback:**  
${values.feedback || ""}  

**Mock Interview Questions:**  
${values.questions
  ?.split("\n")
  .map((q, i) => (q.trim() ? `${i + 1}. ${q.trim()}` : ""))
  .join("\n")}`;
    case "Resume Understanding":
      return `**Task Status:** ${values.taskStatus || ""}  
**Feedback:**  
${values.feedback || ""}`;
    case "Assessment":
      return `**Task Status:** ${values.taskStatus || ""}  
**Assessment Type:** ${values.assessmentType || ""}  
**Feedback:**  
${values.feedback || ""}`;
    default:
      return "";
  }
}

export default function App() {
  const [selectedFormat, setSelectedFormat] = useState("Interview");
  const [fieldValues, setFieldValues] = useState({});
  const [output, setOutput] = useState("");
  const [geminiResult, setGeminiResult] = useState(null);
  const outputRef = useRef(null);

  const current = formats.find((f) => f.name === selectedFormat);

  const handleFieldChange = (key, value) => {
    setFieldValues((v) => ({ ...v, [key]: value }));
  };

  const handleGenerate = async() => {
    setOutput(formatOutput(selectedFormat, fieldValues));
    setGeminiResult(null);
    if(fieldValues.feedback){
      const result = await analyzeFeedbackWithGemini(fieldValues.feedback);
      setGeminiResult(result);
    }
  };

  // Copy as rich HTML if supported, fallback to Markdown text
  const handleCopy = () => {
    if (outputRef.current) {
      const html = outputRef.current.innerHTML;
      if (navigator.clipboard && window.ClipboardItem) {
        const blob = new Blob([html], { type: "text/html" });
        const data = [new window.ClipboardItem({ "text/html": blob })];
        navigator.clipboard.write(data);
        toast.success("Rich text copied!");
      } else {
        navigator.clipboard.writeText(output);
        toast.success("Markdown copied!");
      }
    }
  };

  return (
    <>
      <Toaster />
      <Analytics />
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-2xl rounded-2xl mt-8 space-y-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Feedback Mail Generator
        </h1>
        <div className="flex space-x-2 justify-center mb-6">
          {formats.map((f) => (
            <button
              key={f.name}
              className={`px-4 py-2 rounded-xl font-semibold shadow ${
                selectedFormat === f.name
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-blue-100"
              }`}
              onClick={() => {
                setSelectedFormat(f.name);
                setFieldValues({});
                setOutput("");
              }}
            >
              {f.name}
            </button>
          ))}
        </div>
        <form
          className="space-y-4"
          onSubmit={async(e) => {
            e.preventDefault();
            await handleGenerate();
          }}
        >
          {current.fields.map((field) => (
            <div key={field.key}>
              <label className="block font-semibold mb-1">{field.label}:</label>
              {field.type === "select" ? (
                <select
                  className="w-full rounded-xl border border-gray-400 p-2 focus:ring-2 focus:ring-blue-300"
                  value={fieldValues[field.key] || ""}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <>
                  <textarea
                    className="w-full rounded-xl border border-gray-400 p-2 min-h-[60px] focus:ring-2 focus:ring-blue-300"
                    value={fieldValues[field.key] || ""}
                    onChange={(e) =>
                      handleFieldChange(field.key, e.target.value)
                    }
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    required
                  />
                  {field.key === "feedback" && (
                    <>
                      {geminiResult?.Quality && (
                        <FeedbackQualityMeter quality={geminiResult.Quality} />
                      )}
                      {geminiResult?.Reason && (
                        <div className="mt-1 mb-2 rounded bg-blue-50 border border-blue-200 p-2 text-xs text-blue-900">
                          <strong>Why?</strong> {geminiResult.Reason}
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <input
                  className="w-full rounded-xl border border-gray-400 p-2 focus:ring-2 focus:ring-blue-300"
                  type="text"
                  value={fieldValues[field.key] || ""}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  required
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold shadow hover:bg-blue-700 w-full mt-2"
          >
            Generate Feedback
          </button>
        </form>
        {output && (
          <div className="bg-gray-50 rounded-xl p-4 mt-4 border border-gray-200">
            <div className="font-semibold mb-2">Formatted Feedback Output:</div>
            <div
              className="whitespace-pre-wrap font-mono text-sm"
              ref={outputRef}
            >
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
            <button
              className="cursor-pointer mt-2 px-4 py-2 bg-green-500 text-white rounded-xl font-semibold shadow hover:bg-green-600"
              onClick={handleCopy}
            >
              Copy Output
            </button>
          </div>
        )}
      </div>
      {/* <Gemini feedback={fieldValues.feedback} onResult={setGeminiResult} /> */}
    </>
  );
}
