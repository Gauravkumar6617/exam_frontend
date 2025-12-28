import React, { useState, useEffect } from "react";
import {
  Zap,
  Layers,
  FileUp,
  Globe,
  FileText,
  CheckCircle2,
  Clock,
  BarChart,
  PenTool,
  BookOpen,
  Navigation,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  startExamStream,
  startWebExamStream,
  startPDFExamStream,
  startPYQExtractionStream,
} from "../../../features/exam/examActions";
import type { AppDispatch } from "../../../redux/store/store";
import { useDispatch } from "react-redux";

const EXAM_CONFIG = {
  "UPSC / State PCS": {
    papers: ["General Studies I", "CSAT", "Ethics (GS IV)"],
    topics: [
      "Indian Polity",
      "Modern History",
      "Environment & Ecology",
      "International Relations",
    ],
  },
  "SSC / Railways": {
    papers: ["Tier-1 Composite", "Quant Special", "English Mastery"],
    topics: ["Arithmetic", "Advance Maths", "General Science", "Static GK"],
  },
  "Banking (IBPS/SBI)": {
    papers: ["Prelims", "Mains (GA/Economy Focus)"],
    topics: ["Data Interpretation", "Logical Reasoning", "Banking Awareness"],
  },
};

const PreExam = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [examTime, setExamTime] = useState(60);
  const [selectedMode, setSelectedMode] = useState("single");
  const [setup, setSetup] = useState({
    selectedSubjects: [],
    difficulty: "Medium",
    questions: 20,
    url: "",
    qTypes: ["MCQ"],
    timeLimit: 60,
    customSubject: "",
    isCustomActive: false,
  });
  const [examGroup, setExamGroup] = useState("SSC / Railways");
  const [selectedPaper, setSelectedPaper] = useState(
    EXAM_CONFIG["SSC / Railways"].papers[0]
  );
  const [selectedTopic, setSelectedTopic] = useState(
    EXAM_CONFIG["SSC / Railways"].topics[0]
  );
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setSetup((prev) => ({ ...prev, selectedSubjects: [] }));
  }, [examGroup]);

  const handleGroupChange = (group: string) => {
    setExamGroup(group);
    setSelectedPaper(EXAM_CONFIG[group].papers[0]);
    setSelectedTopic(EXAM_CONFIG[group].topics[0]);
  };

  const handleStart = async () => {
    // 1. Initial Validation
    if ((selectedMode === "pdf-pyq" || selectedMode === "pdf-quiz") && !file) {
      alert("Please upload a PDF file first!");
      return;
    }
    if (selectedMode === "web-quiz" && !setup.url.startsWith("http")) {
      alert("Please enter a valid URL!");
      return;
    }

    // Validate Custom Topic if active (not for PYQ Exact)
    if (!isPYQ && setup.isCustomActive && !setup.customSubject.trim()) {
      alert("Please enter a custom topic/subject name!");
      return;
    }

    // 2. Start Loading State
    setIsGenerating(true);

    try {
      // 1. Get the list of selected preset subjects
      let selectedPresets =
        setup.selectedSubjects.length > 0
          ? setup.selectedSubjects.join(", ")
          : selectedTopic;

      // 2. COMBINE: Include both presets AND the custom topic if active
      let subjects =
        setup.isCustomActive && setup.customSubject.trim()
          ? `${selectedPresets}, ${setup.customSubject.trim()}`
          : selectedPresets;

      if (selectedMode === "pdf-pyq") {
        const success = await dispatch(
          startPYQExtractionStream(file!, setup.questions)
        );
        if (success) navigate("/TandC");
        else alert("Extraction failed. Please try again.");
      } else if (selectedMode === "pdf-quiz") {
        // Pass the combined subjects to focus extraction from notes
        await dispatch(
          startPDFExamStream(
            file!,
            setup.difficulty,
            setup.questions,
            setup.qTypes,
            subjects
          )
        );
        navigate("/TandC");
      } else if (selectedMode === "web-quiz") {
        // Pass the combined subjects to focus extraction from URL
        await dispatch(
          startWebExamStream(
            setup.url,
            setup.difficulty,
            setup.questions,
            setup.qTypes,
            subjects
          )
        );
        navigate("/TandC");
      } else {
        // Standard Mock generation using the full combined string
        const topicString = `${examGroup} - ${selectedPaper}: ${subjects}`;
        await dispatch(
          startExamStream(
            topicString,
            setup.difficulty,
            setup.questions,
            setup.qTypes
          )
        );
        navigate("/TandC");
      }
    } catch (error) {
      console.error("Exam Start Error:", error);
      alert("An error occurred while preparing your exam.");
    } finally {
      setIsGenerating(false);
    }
  };
  const modes = [
    {
      id: "single",
      title: "Subject Mock",
      desc: "Focus on one area.",
      icon: <Zap size={22} color="#6366f1" />,
      color: "#f5f3ff",
    },
    {
      id: "multi",
      title: "Full Paper",
      desc: "Combined pattern.",
      icon: <Layers size={22} color="#10b981" />,
      color: "#ecfdf5",
    },
    {
      id: "pdf-pyq",
      title: "PYQ Exact",
      desc: "Original Papers.",
      icon: <FileText size={22} color="#ef4444" />,
      color: "#fef2f2",
    },
    {
      id: "pdf-quiz",
      title: "PDF Notes",
      desc: "Mock from notes.",
      icon: <FileUp size={22} color="#f59e0b" />,
      color: "#fffbeb",
    },
    {
      id: "web-quiz",
      title: "Web URL",
      desc: "Mock from URL.",
      icon: <Globe size={22} color="#06b6d4" />,
      color: "#ecfeff",
    },
  ];

  const questionPatterns = [
    { id: "MCQ", label: "Standard MCQ", icon: <CheckCircle2 size={14} /> },
    { id: "Passage", label: "Unseen Passage", icon: <BookOpen size={14} /> },
    {
      id: "True/False",
      label: "True / False",
      icon: <Zap size={14} color="#f59e0b" />,
    },
    {
      id: "Assertion",
      label: "Assertion-Reason",
      icon: <Layers size={14} color="#ef4444" />,
    },
    { id: "Descriptive", label: "Short Answer", icon: <PenTool size={14} /> },
  ];

  const isPYQ = selectedMode === "pdf-pyq";

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <header style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "800", color: "#111" }}>
          Govt Exam Preparation Hub
        </h2>
        <p style={{ color: "#666" }}>
          AI-Powered Mock Generation & PYQ Extraction
        </p>
      </header>

      {/* --- MODE SELECTION --- */}
      <div style={modeGrid}>
        {modes.map((mode) => (
          <div
            key={mode.id}
            onClick={() => {
              setSelectedMode(mode.id);
              setFile(null);
            }}
            style={{
              ...modeBlock,
              backgroundColor: "white",
              border:
                selectedMode === mode.id
                  ? `2px solid #4f46e5`
                  : "1px solid #e5e7eb",
            }}
          >
            <div style={{ ...iconCircle, backgroundColor: mode.color }}>
              {mode.icon}
            </div>
            <h3
              style={{
                fontSize: "15px",
                margin: "12px 0 4px 0",
                fontWeight: "700",
              }}
            >
              {mode.title}
            </h3>
            <p style={{ fontSize: "11px", color: "#6b7280" }}>{mode.desc}</p>
          </div>
        ))}
      </div>

      <div style={mainGrid}>
        {/* --- LEFT COLUMN: SOURCE --- */}
        <div style={configContainer}>
          <div style={sectionHeader}>1. Source Details</div>
          <div style={{ padding: "20px" }}>
            {selectedMode === "web-quiz" ? (
              <div style={inputGroup}>
                <label style={labelStyle}>Website URL</label>
                <input
                  type="url"
                  placeholder="Paste link..."
                  style={inputStyle}
                  value={setup.url}
                  onChange={(e) => setSetup({ ...setup, url: e.target.value })}
                />
              </div>
            ) : selectedMode === "pdf-quiz" || isPYQ ? (
              <div
                style={{
                  ...uploadBox,
                  borderColor: isPYQ ? "#ef4444" : "#4f46e5",
                }}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  style={{ display: "none" }}
                  id="pdf-upload-input"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <Upload
                  size={30}
                  color={file ? "#10b981" : isPYQ ? "#ef4444" : "#4f46e5"}
                />
                <p style={{ fontWeight: "700", margin: "10px 0" }}>
                  {isPYQ ? "Official Question Paper PDF" : "Upload Study Notes"}
                </p>
                <button
                  style={secondaryBtn}
                  onClick={() =>
                    document.getElementById("pdf-upload-input")?.click()
                  }
                >
                  {file ? file.name : "Choose PDF"}
                </button>
              </div>
            ) : (
              <div style={inputGroup}>
                <label style={labelStyle}>Select Subject(s)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {EXAM_CONFIG[examGroup].topics.map((s) => (
                    <button
                      key={s}
                      onClick={() =>
                        setSetup((prev) => ({
                          ...prev,
                          selectedSubjects: prev.selectedSubjects.includes(s)
                            ? prev.selectedSubjects.filter((i) => i !== s)
                            : [...prev.selectedSubjects, s],
                        }))
                      }
                      style={{
                        ...chipStyle,
                        backgroundColor: setup.selectedSubjects.includes(s)
                          ? "#4f46e5"
                          : "white",
                        color: setup.selectedSubjects.includes(s)
                          ? "white"
                          : "#4b5563",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!isPYQ && (
              <div
                style={{
                  marginTop: "25px",
                  paddingTop: "20px",
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <div
                  onClick={() =>
                    setSetup({
                      ...setup,
                      isCustomActive: !setup.isCustomActive,
                    })
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    marginBottom: "10px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={setup.isCustomActive}
                    onChange={() => {}} // Handled by div click
                    style={{ accentColor: "#4f46e5" }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#4b5563",
                    }}
                  >
                    Add Custom Topic/Subject
                  </span>
                </div>

                {setup.isCustomActive && (
                  <div style={inputGroup}>
                    <input
                      type="text"
                      placeholder="e.g. Ancient Indian Architecture, Quantum Physics..."
                      style={inputStyle}
                      value={setup.customSubject}
                      onChange={(e) =>
                        setSetup({ ...setup, customSubject: e.target.value })
                      }
                    />
                    <p
                      style={{
                        fontSize: "10px",
                        color: "#9ca3af",
                        marginTop: "5px",
                      }}
                    >
                      AI will focus primarily on this specific topic.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={configContainer}>
          <div style={sectionHeader}>2. Configuration</div>
          <div style={{ padding: "20px" }}>
            {/* HIDE THESE IF PYQ EXACT IS SELECTED */}
            {!isPYQ && (
              <>
                <label style={labelStyle}>Include Question Types</label>
                <div style={qTypeGrid}>
                  {questionPatterns.map((p) => (
                    <div
                      key={p.id}
                      onClick={() =>
                        setSetup((prev) => ({
                          ...prev,
                          qTypes: prev.qTypes.includes(p.id)
                            ? prev.qTypes.filter((t) => t !== p.id)
                            : [...prev.qTypes, p.id],
                        }))
                      }
                      style={{
                        ...typeItem,
                        borderColor: setup.qTypes.includes(p.id)
                          ? "#4f46e5"
                          : "#e5e7eb",
                        backgroundColor: setup.qTypes.includes(p.id)
                          ? "#f5f3ff"
                          : "transparent",
                      }}
                    >
                      {p.icon} <span>{p.label}</span>
                    </div>
                  ))}
                </div>

                <div style={dropdownGrid}>
                  <div style={inputGroup}>
                    <label style={labelStyle}>
                      <Navigation size={14} /> Exam Group
                    </label>
                    <select
                      style={inputStyle}
                      value={examGroup}
                      onChange={(e) => handleGroupChange(e.target.value)}
                    >
                      {Object.keys(EXAM_CONFIG).map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={inputGroup}>
                    <label style={labelStyle}>
                      <Layers size={14} /> Paper
                    </label>
                    <select
                      style={inputStyle}
                      value={selectedPaper}
                      onChange={(e) => setSelectedPaper(e.target.value)}
                    >
                      {EXAM_CONFIG[examGroup].papers.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: "15px" }}>
                  <label style={labelStyle}>
                    <BarChart size={14} /> Difficulty
                  </label>
                  <select
                    style={inputStyle}
                    value={setup.difficulty}
                    onChange={(e) =>
                      setSetup({ ...setup, difficulty: e.target.value })
                    }
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                    <option>Expert</option>
                  </select>
                </div>
              </>
            )}

            {/* ALWAYS SHOW TOTAL QUESTIONS & DURATION */}
            <div style={{ marginTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={labelStyle}>Questions to Extract/Generate</label>
                <span style={{ fontWeight: "bold", color: "#4f46e5" }}>
                  {setup.questions}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                style={{
                  width: "100%",
                  accentColor: isPYQ ? "#ef4444" : "#4f46e5",
                }}
                value={setup.questions}
                onChange={(e) =>
                  setSetup({ ...setup, questions: parseInt(e.target.value) })
                }
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>
                <Clock size={14} /> Exam Duration
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[10, 30, 60, 120].map((m) => (
                  <button
                    key={m}
                    onClick={() => setExamTime(m)}
                    style={{
                      ...chipStyle,
                      backgroundColor: examTime === m ? "#4f46e5" : "#f1f5f9",
                      color: examTime === m ? "#fff" : "#333",
                    }}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={isGenerating}
              style={{
                ...startBtnStyle,
                opacity: isGenerating ? 0.7 : 1,
                cursor: isGenerating ? "not-allowed" : "pointer",
                backgroundColor:
                  selectedMode === "pdf-pyq" ? "#ef4444" : "#4f46e5",
              }}
            >
              {isGenerating
                ? "Processing questions..."
                : selectedMode === "pdf-pyq"
                ? "Extract PYQ"
                : "Generate Mock Test"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles (same as before)
const modeGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: "12px",
  marginBottom: "30px",
};
const mainGrid = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr",
  gap: "25px",
};
const qTypeGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
};
const dropdownGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
  marginTop: "15px",
};
const modeBlock = {
  padding: "15px",
  borderRadius: "16px",
  cursor: "pointer",
  transition: "0.2s",
};
const iconCircle = {
  width: "42px",
  height: "42px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const configContainer = {
  background: "white",
  borderRadius: "16px",
  border: "1px solid #e5e7eb",
  overflow: "hidden",
};
const sectionHeader = {
  padding: "12px 20px",
  background: "#f8fafc",
  borderBottom: "1px solid #eee",
  fontWeight: "700",
  fontSize: "14px",
};
const labelStyle = {
  fontSize: "13px",
  fontWeight: "600",
  marginBottom: "8px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};
const inputGroup = { display: "flex", flexDirection: "column" };
const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
};
const chipStyle = {
  padding: "6px 12px",
  borderRadius: "20px",
  border: "1px solid #e5e7eb",
  fontSize: "12px",
  cursor: "pointer",
};
const typeItem = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "12px",
  cursor: "pointer",
};
const uploadBox = {
  border: "2px dashed #e5e7eb",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center" as const,
  background: "#f9fafb",
};
const secondaryBtn = {
  padding: "8px 14px",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
  background: "white",
  cursor: "pointer",
  fontSize: "12px",
  marginTop: "10px",
};
const startBtnStyle = {
  width: "100%",
  color: "white",
  padding: "14px",
  borderRadius: "8px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "25px",
};
const inputGroupStyle = {
  marginTop: "20px",
  padding: "15px",
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
};

export default PreExam;
