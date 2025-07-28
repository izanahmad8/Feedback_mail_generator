import React, { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';

const formats = [
  {
    name: "Interview",
    fields: [
      { key: "taskStatus", label: "Task Status", type: "select", options: ["Completed", "Cancelled", "Rescheduled", "Not Done"] },
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
          "Loop"
        ]
      },
      { key: "feedback", label: "Feedback", type: "textarea" },
      { key: "questions", label: "Interview Questions Asked", type: "textarea" },
    ],
  },
  {
    name: "Mock Interview",
    fields: [
      { key: "taskStatus", label: "Task Status", type: "select", options: ["Completed", "Not Done", "Cancelled"] },
      { key: "feedback", label: "Feedback", type: "textarea" },
      { key: "questions", label: "Mock Interview Questions", type: "textarea" },
    ],
  },
  {
    name: "Resume Understanding",
    fields: [
      { key: "taskStatus", label: "Task Status", type: "select", options: ["Completed", "Not Done", "Cancelled"] },
      { key: "feedback", label: "Feedback", type: "textarea" },
    ],
  },
  {
    name: "Assessment",
    fields: [
      { key: "taskStatus", label: "Task Status", type: "select", options: ["Completed", "Not Done", "Cancelled"] },
      { key: "assessmentType", label: "Assessment Type", type: "select", options: ["Behavioral", "Technical"] },
      { key: "feedback", label: "Feedback", type: "textarea" },
    ],
  },
];

function formatOutput(selected, values) {
  switch (selected) {
    case "Interview":
      return `Task Status: ${values.taskStatus || ""}
Interview Round: ${values.interviewRound || ""}
Feedback:
${values.feedback || ""}
Interview Questions Asked:
${values.questions
        ?.split("\n")
        .map((q, i) => (q.trim() ? `${i + 1}. ${q.trim()}` : ""))
        .join("\n")}`;
    case "Mock Interview":
      return `Task Status: ${values.taskStatus || ""}
Feedback:
${values.feedback || ""}
Mock Interview Questions:
${values.questions
        ?.split("\n")
        .map((q, i) => (q.trim() ? `${i + 1}. ${q.trim()}` : ""))
        .join("\n")}`;
    case "Resume Understanding":
      return `Task Status: ${values.taskStatus || ""}
Feedback:
${values.feedback || ""}`;
    case "Assessment":
      return `Task Status: ${values.taskStatus || ""}
Assessment Type: ${values.assessmentType || ""}
Feedback:
${values.feedback || ""}`;
    default:
      return "";
  }
}

export default function App() {
  const [selectedFormat, setSelectedFormat] = useState("Interview");
  const [fieldValues, setFieldValues] = useState({});
  const [output, setOutput] = useState("");

  const current = formats.find((f) => f.name === selectedFormat);

  const handleFieldChange = (key, value) => {
    setFieldValues((v) => ({ ...v, [key]: value }));
  };

  const handleGenerate = () => {
    setOutput(formatOutput(selectedFormat, fieldValues));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Text Copied");
  };

  return (
    <>
    <Toaster/>
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-2xl rounded-2xl mt-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Feedback Mail Generator</h1>
      <div className="flex space-x-2 justify-center mb-6">
        {formats.map((f) => (
          <button
            key={f.name}
            className={`px-4 py-2 rounded-xl font-semibold shadow ${selectedFormat === f.name ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-blue-100"}`}
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
        onSubmit={e => {
          e.preventDefault();
          handleGenerate();
        }}
      >
        {current.fields.map(field => (
          <div key={field.key}>
            <label className="block font-semibold mb-1">{field.label}:</label>
            {field.type === "select" ? (
              <select
                className="w-full rounded-xl border border-gray-400 p-2 focus:ring-2 focus:ring-blue-300"
                value={fieldValues[field.key] || ""}
                onChange={e => handleFieldChange(field.key, e.target.value)}
                required
              >
                <option value="">Select</option>
                {field.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                className="w-full rounded-xl border border-gray-400 p-2 min-h-[60px] focus:ring-2 focus:ring-blue-300"
                value={fieldValues[field.key] || ""}
                onChange={e => handleFieldChange(field.key, e.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                required
              />
            ) : (
              <input
                className="w-full rounded-xl border border-gray-400 p-2 focus:ring-2 focus:ring-blue-300"
                type="text"
                value={fieldValues[field.key] || ""}
                onChange={e => handleFieldChange(field.key, e.target.value)}
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
          <pre className="whitespace-pre-wrap font-mono text-sm">{output}</pre>
          <button
            className="cursor-pointer mt-2 px-4 py-2 bg-green-500 text-white rounded-xl font-semibold shadow hover:bg-green-600"
            onClick={handleCopy}
          >
            Copy Output
          </button>
        </div>
      )}
    </div>
    </>
    
  );
}
