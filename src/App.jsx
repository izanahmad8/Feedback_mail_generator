import { useState, useRef, Fragment } from "react";
import { Analytics } from "@vercel/analytics/react";
import toast, { Toaster } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { analyzeFeedbackWithGemini } from "./Gemini";
import FeedbackQualityMeter from "./FeedbackQualityMeter";
import { motion } from "framer-motion";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

/* -------------------------------------------
   CustomSelect (Headless UI Listbox)
------------------------------------------- */
function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select",
}) {
  return (
    <Listbox value={value || ""} onChange={onChange}>
      {({ open }) => (
        <div className="relative">
          <ListboxButton
            className={`w-full rounded-2xl border border-slate-300 bg-white p-3 text-left text-slate-900 shadow-sm transition focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 flex items-center justify-between ${
              value ? "" : "text-slate-400"
            }`}
          >
            <span>{value || placeholder}</span>
            {/* Chevron */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`h-5 w-5 transition-transform ${
                open ? "rotate-180" : "rotate-0"
              }`}
            >
              <path d="M6.75 9l5.25 5.25L17.25 9" />
            </svg>
          </ListboxButton>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 -translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-1"
          >
            <ListboxOptions className="absolute z-20 mt-2 max-h-60 w-full overflow-auto custom-scroll rounded-2xl border border-slate-200 bg-white py-1 shadow-2xl focus:outline-none">
              {/* Placeholder row */}
              <ListboxOption
                key="__placeholder"
                value=""
                className={({ focus }) =>
                  `relative cursor-pointer select-none px-4 py-2 text-sm ${
                    focus ? "bg-blue-50 text-blue-700" : "text-slate-700"
                  }`
                }
              >
                {({ selected }) => (
                  <div className="flex items-center gap-2">
                    {selected ? (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="inline-block h-4 w-4" />
                    )}
                    <span className="truncate">{placeholder}</span>
                  </div>
                )}
              </ListboxOption>

              {options.map((opt) => (
                <ListboxOption
                  key={opt}
                  value={opt}
                  className={({ active }) =>
                    `relative cursor-pointer select-none px-4 py-2 text-sm ${
                      active ? "bg-blue-50 text-blue-700" : "text-slate-700"
                    }`
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center gap-2">
                      {selected ? (
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="inline-block h-4 w-4" />
                      )}
                      <span
                        className={`truncate ${
                          selected ? "font-semibold" : ""
                        }`}
                      >
                        {opt}
                      </span>
                    </div>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>

          {/* Hidden input to preserve native form 'required' behavior */}
          <input
            tabIndex={-1}
            className="sr-only"
            value={value || ""}
            onChange={() => {}}
            required
          />
        </div>
      )}
    </Listbox>
  );
}

/* -------------------------------------------
   Formats config (unchanged)
------------------------------------------- */
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
          "On Demand or AI Interview",
          "1st Round",
          "2nd Round",
          "3rd Round",
          "4th Round",
          "5th Round",
          "Technical Round",
          "Coding Round",
          "Final Round",
          "Loop Round",
        ],
      },
      {
        key: "feedback",
        label: "Feedback",
        type: "textarea",
        placeholder:
          "Brief on the candidate's performance: answer quality, communication, confidence, possibility of moving to next round. If cancelled/not done, state reason – e.g., no show, cancellation, etc.",
      },
      {
        key: "questions",
        label: "Interview Questions Asked",
        type: "textarea",
        placeholder:
          "List the questions asked in the interview (if AI-generated, ensure review before sharing).",
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
      {
        key: "feedback",
        label: "Feedback",
        type: "textarea",
        placeholder:
          "Comments on candidate behavior, technical/soft skills, communication ability, and key improvement areas.",
      },
      {
        key: "questions",
        label: "Mock Interview Questions",
        type: "textarea",
        placeholder:
          "List of questions asked during the session (ensure validity if auto-generated).",
      },
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
      {
        key: "feedback",
        label: "Feedback",
        type: "textarea",
        placeholder:
          "Notes or remarks based on resume analysis – skill highlights, gaps, relevant experience, or inconsistencies.",
      },
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
        options: ["Behavioral", "Technical", "Behavioral/Technical"],
      },
      {
        key: "feedback",
        label: "Feedback",
        type: "textarea",
        placeholder:
          "Briefly describe the assessment — e.g., coding challenge (JavaScript array manipulations), behavioral test (situational judgment), case study, multiple-choice test, etc. Was the assessment completed end-to-end? Any sections that were complex or required extra effort. If applicable, mention whether any instructions from the candidate/client were followed.",
      },
    ],
  },
];

/* -------------------------------------------
   Output formatter (unchanged)
------------------------------------------- */
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

/* -------------------------------------------
   App Component
------------------------------------------- */
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

  const handleGenerate = async () => {
    setOutput(formatOutput(selectedFormat, fieldValues));
    setGeminiResult(null);
    if (fieldValues.feedback) {
      const result = await analyzeFeedbackWithGemini(fieldValues.feedback);
      setGeminiResult(result);
    }
  };

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
      <SpeedInsights />

      {/* Page Background */}
      <div className="min-h-screen w-full bg-gradient-to-br from-[#f8fbff] via-[#f5f7fb] to-[#eef2f7] selection:bg-blue-200/60 selection:text-blue-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          {/* App Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/70 bg-white/80 backdrop-blur-md"
          >
            {/* Accent Glow */}
            <div className="pointer-events-none absolute -inset-0.5 rounded-[28px] bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-2xl" />

            <div className="relative">
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                  Feedback Mail Generator
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Create clean, structured feedback in seconds. Paste, pick, and
                  go.
                </p>
              </div>

              {/* Format Switcher */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
                {formats.map((f) => (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    key={f.name}
                    className={`group relative px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-semibold shadow-sm border transition-all ${
                      selectedFormat === f.name
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent"
                        : "bg-white text-slate-700 hover:text-blue-700 border-slate-200 hover:border-blue-200 hover:shadow-md"
                    }`}
                    onClick={() => {
                      setSelectedFormat(f.name);
                      setFieldValues({});
                      setOutput("");
                    }}
                  >
                    <span className="pr-0.5">{f.name}</span>
                    {selectedFormat === f.name && (
                      <span className="ml-2 inline-block h-2 w-2 rounded-full bg-white/90 shadow" />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Form */}
              <form
                className="space-y-5"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handleGenerate();
                }}
              >
                {current.fields.map((field) => (
                  <div key={field.key} className="group">
                    <label className="block font-semibold mb-1.5 text-slate-800">
                      {field.label}
                    </label>

                    {field.type === "select" ? (
                      <CustomSelect
                        value={fieldValues[field.key] || ""}
                        onChange={(val) => handleFieldChange(field.key, val)}
                        options={field.options || []}
                        placeholder="Select"
                      />
                    ) : field.type === "textarea" ? (
                      <>
                        <textarea
                          className="w-full rounded-2xl border border-slate-300 bg-white p-3 min-h-[100px] text-slate-900 shadow-sm transition focus:ring-4 focus:ring-blue-200 focus:border-blue-400 outline-none placeholder:text-slate-400"
                          value={fieldValues[field.key] || ""}
                          onChange={(e) =>
                            handleFieldChange(field.key, e.target.value)
                          }
                          placeholder={`Enter ${field.placeholder}`}
                          rows={5}
                          cols={40}
                          required={field.label !== "Interview Questions Asked"}
                        />
                        <div className="mt-1 text-xs text-slate-500">
                          Tip: Use line breaks to add multiple items.
                        </div>

                        {field.key === "feedback" && (
                          <div className="mt-2 space-y-2">
                            {geminiResult?.Quality && (
                              <FeedbackQualityMeter
                                quality={geminiResult.Quality}
                              />
                            )}
                            {geminiResult?.Reason && (
                              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900">
                                <strong className="font-semibold">Why?</strong>{" "}
                                {geminiResult.Reason}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <input
                        className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-slate-900 shadow-sm transition focus:ring-4 focus:ring-blue-200 focus:border-blue-400 outline-none placeholder:text-slate-400"
                        type="text"
                        value={fieldValues[field.key] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.key, e.target.value)
                        }
                        required
                        placeholder={`Enter ${field.placeholder}`}
                        aria-label={field.label}
                      />
                    )}
                  </div>
                ))}

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  type="submit"
                  className="cursor-pointer relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl w-full mt-2 focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  <span className="relative z-10">Generate Feedback</span>
                  <span className="absolute inset-0 opacity-0 hover:opacity-20 transition bg-white" />
                </motion.button>
              </form>

              {/* Output */}
              {output && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/90 rounded-2xl p-4 mt-6 border border-slate-200 shadow-inner"
                >
                  <div className="font-semibold mb-2 text-slate-800">
                    Formatted Feedback Output
                  </div>
                  <div
                    className="whitespace-pre-wrap font-mono text-[13px] leading-6 text-slate-800 max-h-72 overflow-y-auto pr-1 custom-scroll"
                    ref={outputRef}
                  >
                    <ReactMarkdown>{output}</ReactMarkdown>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="cursor-pointer px-4 py-2 bg-emerald-500 text-white rounded-xl font-semibold shadow hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                      onClick={handleCopy}
                    >
                      Copy Output
                    </motion.button>

                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl font-semibold border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700 hover:shadow-md transition"
                      onClick={() =>
                        toast("You can paste this directly into email.")
                      }
                    >
                      How to use
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
