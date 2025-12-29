import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../hook";
import { selectOption } from "../../../features/exam/examSlice";
import axios from "axios";

export const SSCExamInterface = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const examState = useAppSelector((state) => state.exam);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [visitedQuestions, setVisitedQuestions] = useState<number[]>([]);
  const [examStarted, setExamStarted] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  // 1. MASTER PARSER (Extracts all questions into a single list)
  const questions = useMemo(() => {
    if (!examState?.streamedText) {
      console.log("Empty stream: Waiting for AI content...");
      return [];
    }

    const text = examState.streamedText;
    const startIndex = text.indexOf("[");
    if (startIndex === -1) {
      console.warn(
        "Array bracket '[' not found yet. Current raw text length:",
        text.length
      );
      return [];
    }

    // Log the raw content being processed
    console.log("📥 STARTING PARSER: Found JSON array start.");

    const rawText = text
      .substring(startIndex)
      .replace(/```json|```/g, "")
      .trim();

    // Improved regex to handle nested objects more robustly
    const objectRegex = /\{(?:[^{}]|(?:\{[^{}]*\}))*\}/gs;
    const matches = rawText.match(objectRegex);

    if (!matches) {
      console.log("No complete JSON objects found in stream yet.");
      return [];
    }

    console.log(`📦 STREAM STATUS: Detected ${matches.length} raw blocks.`);

    const allParsedQuestions: any[] = [];

    matches.forEach((block, index) => {
      try {
        // 1. Sanitize the individual block
        let cleanedBlock = block.trim().replace(/,(\s*})$/, "$1");

        // Fix literal newlines inside strings that break JSON.parse
        cleanedBlock = cleanedBlock.replace(/"([^"]*)"/g, (match) => {
          return match.replace(/\n/g, "\\n");
        });

        const parsed = JSON.parse(cleanedBlock);

        // 2. LOGIC: Handle Section blocks vs Standalone question blocks
        if (parsed.questions && Array.isArray(parsed.questions)) {
          console.log(
            `📂 SECTION DETECTED: "${
              parsed.name || "Unnamed Section"
            }" | Questions in block: ${parsed.questions.length}`
          );

          parsed.questions.forEach((q: any, qIdx: number) => {
            const formattedQ = {
              ...q,
              question: q.question_text || q.question || "No text available",
              options: Array.isArray(q.options) ? q.options : [],
              image_url: null,
            };

            allParsedQuestions.push(formattedQ);
            console.log(
              `   ✅ Extracted Q${
                allParsedQuestions.length
              }: ${formattedQ.question.substring(0, 50)}...`
            );
          });
        } else if (parsed.question || parsed.question_text) {
          const formattedQ = {
            ...parsed,
            question: parsed.question_text || parsed.question,
            options: Array.isArray(parsed.options) ? parsed.options : [],
            image_url: null,
          };

          allParsedQuestions.push(formattedQ);
          console.log(
            `📝 STANDALONE Q DETECTED: Added Q${allParsedQuestions.length}`
          );
        } else {
          console.warn(
            `⏭️ SKIPPING BLOCK ${
              index + 1
            }: Found object but no question keys present.`,
            parsed
          );
        }
      } catch (e) {
        console.error(`❌ PARSE FAILURE at Block ${index + 1}:`, e);
        console.debug("Broken Raw Text:", block);
      }
    });

    console.log(
      `🚀 FINAL STATE: Sending ${allParsedQuestions.length} questions to UI.`
    );
    return allParsedQuestions;
  }, [examState?.streamedText]);
  if (!examState) return null;
  const { topic, userAnswers } = examState;
  const currentQuestion = questions[currentQuestionIndex];

  // 2. TRACK VISITED STATUS
  useEffect(() => {
    if (
      currentQuestionIndex !== -1 &&
      !visitedQuestions.includes(currentQuestionIndex)
    ) {
      setVisitedQuestions((prev) => [...prev, currentQuestionIndex]);
    }
  }, [currentQuestionIndex]);

  // 3. TIMER LOGIC
  const initialMinutes = useMemo(() => {
    const t = topic?.toUpperCase() || "";
    const match = t.match(/(\d+)\s*MIN/);
    return match ? parseInt(match[1]) : 60;
  }, [topic]);

  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const hiddenTimeThreshold = useMemo(
    () => Math.floor(Math.random() * 6) + 10,
    []
  );

  useEffect(() => {
    if (questions.length > 0 && !examStarted) setExamStarted(true);
  }, [questions, examStarted]);

  useEffect(() => {
    if (!examStarted) return;
    if (timeLeft <= hiddenTimeThreshold) {
      handleFinalSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, examStarted]);

  const formatTimer = (seconds: number) => {
    const displaySeconds = Math.max(0, seconds - hiddenTimeThreshold);
    const h = Math.floor(displaySeconds / 3600);
    const m = Math.floor((displaySeconds % 3600) / 60);
    const s = displaySeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
  };

  // 4. FINAL SUBMIT
  const handleFinalSubmit = async () => {
    // 1. Identify the subject from the topic
    const subjectName = topic || "General Intelligence";

    console.log(
      `🔍 [DEBUG] Processing submission for subject: "${subjectName}"`
    );

    const clean = (str: any) =>
      String(str || "")
        .replace(/^[A-Z]\)\s*/i, "")
        .trim()
        .toLowerCase();

    let correctCount = 0;
    questions.forEach((q, index) => {
      const uAns = userAnswers[index];
      const cAns = q.answer;

      if (uAns) {
        const isCorrect = clean(uAns) === clean(cAns);
        if (isCorrect) correctCount++;

        // Detailed log for each question's result
        console.log(
          `Q${
            index + 1
          } [${subjectName}]: User: "${uAns}" | Correct: "${cAns}" -> ${
            isCorrect ? "✅" : "❌"
          }`
        );
      }
    });

    const attemptedCount = Object.keys(userAnswers).length;
    const wrongCount = attemptedCount - correctCount;
    const finalScore = correctCount * 2 - wrongCount * 0.5;

    // 2. Prepare dynamic sectional breakdown
    const sectionalPayload = {
      [subjectName.toLowerCase().replace(/\s+/g, "_")]: parseFloat(
        (correctCount * 2).toFixed(2)
      ),
    };

    const payload = {
      user_id: "Amita",
      topic: subjectName,
      total_questions: questions.length,
      attempted: attemptedCount,
      correct: correctCount,
      wrong: wrongCount,
      score: parseFloat(finalScore.toFixed(2)),
      accuracy: parseFloat(
        (attemptedCount > 0
          ? (correctCount / attemptedCount) * 100
          : 0
        ).toFixed(2)
      ),
      time_spent: initialMinutes * 60 - timeLeft,
      sectional_breakdown: sectionalPayload, // Dynamically keyed by subject
    };

    // 3. Final Verification Log
    console.log("📤 [API PAYLOAD] Ready to send to Database:");
    console.table({
      Subject: subjectName,
      Total: payload.total_questions,
      Attempted: payload.attempted,
      Score: payload.score,
      Sectional_Key: Object.keys(payload.sectional_breakdown)[0],
      Sectional_Value: Object.values(payload.sectional_breakdown)[0],
    });

    try {
      const response = await axios.post(
        "https://python-backend-z4tp.onrender.com/api/stats/save-result",
        payload
      );
      console.log("✅ [BACKEND SUCCESS]:", response.data);

      navigate("/SubmittedScreen", {
        state: { ...payload, allQuestions: questions, userAnswers },
      });
    } catch (error) {
      console.error("❌ [BACKEND ERROR]:", error);
      navigate("/SubmittedScreen", {
        state: { ...payload, allQuestions: questions, userAnswers },
      });
    }
  };

  const handleSaveAndNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  return (
    <div style={containerStyle}>
      <style>{`
        .tcs-progress-bar { width: 300px; height: 14px; background-color: #e0e0e0; border-radius: 2px; overflow: hidden; margin-bottom: 15px; border: 1px solid #ccc; }
        .tcs-progress-fill { width: 60%; height: 100%; background: repeating-linear-gradient(45deg, #286090, #286090 10px, #337ab7 10px, #337ab7 20px); animation: progress-move 2s linear infinite; }
        @keyframes progress-move { 0% { background-position: 0 0; } 100% { background-position: 40px 0; } }
        .loading-text-bold { color: #c9302c; font-weight: bold; font-size: 14px; text-transform: uppercase; }
        .exam-loader-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background-color: #f9f9f9; }
      `}</style>

      <header style={{ ...headerStyle, backgroundColor: colors.topHeader }}>
        <div style={{ fontSize: "14px", fontWeight: "bold" }}>
          {topic?.toUpperCase()}
        </div>
        <div style={timerBoxStyle}>{formatTimer(timeLeft)}</div>
      </header>

      {/* TABS REMOVED FROM HERE */}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={leftPanelStyle}>
          <div style={sectionLabelStyle}>Questions List</div>
          <div
            style={{
              flex: 1,
              padding: "25px",
              overflowY: "auto",
              backgroundColor: "#fff",
            }}
          >
            {questions.length > 0 && currentQuestion ? (
              <>
                {/* Question Number & Marks */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "15px",
                  }}
                >
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                    Question No. {currentQuestionIndex + 1}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Marks: <span style={{ color: "#2d8a2d" }}>+2.0</span> |
                    Negative: <span style={{ color: "#c9302c" }}>-0.5</span>
                  </div>
                </div>

                {/* Main Question Area - Optimized for ASCII Diagrams */}
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: "25px",
                    lineHeight: "1.6",
                    padding: "15px",
                    borderLeft: "4px solid #337ab7", // Adds the professional blue accent
                    backgroundColor: "#f9f9f9",
                    whiteSpace: "pre-wrap", // Essential for keeping ASCII boxes aligned
                    // Use monospace only if content looks like a diagram
                    fontFamily:
                      currentQuestion.question.includes("|") ||
                      currentQuestion.question.includes("+--")
                        ? '"Courier New", Courier, monospace'
                        : "inherit",
                  }}
                >
                  {currentQuestion.question}
                </div>

                {/* MCQ / Options Section */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {currentQuestion.options &&
                  currentQuestion.options.length > 0 ? (
                    currentQuestion.options.map((opt: string, i: number) => {
                      const isSelected =
                        userAnswers[currentQuestionIndex] === opt;
                      return (
                        <label
                          key={i}
                          style={{
                            ...optionStyle,
                            backgroundColor: isSelected ? "#e7f3ff" : "#fff",
                            borderColor: isSelected ? "#337ab7" : "#e5e7eb",
                            display: "flex",
                            alignItems: "flex-start",
                            padding: "12px",
                            borderRadius: "4px",
                            border: "1px solid",
                            cursor: "pointer",
                            transition: "0.2s",
                          }}
                        >
                          <input
                            type="radio"
                            name={`q-${currentQuestionIndex}`}
                            checked={isSelected}
                            onChange={() =>
                              dispatch(
                                selectOption({
                                  index: currentQuestionIndex,
                                  answer: opt,
                                })
                              )
                            }
                            style={{ marginTop: "4px" }}
                          />
                          <div
                            style={{
                              marginLeft: "10px",
                              fontSize: "14px",
                              whiteSpace: "pre-wrap",
                              fontFamily: opt.includes("|")
                                ? '"Courier New", monospace'
                                : "inherit",
                            }}
                          >
                            <span
                              style={{ fontWeight: "bold", marginRight: "5px" }}
                            >
                              ({i + 1})
                            </span>
                            {opt}
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    /* Text input fallback for numeric questions */
                    <div style={inputContainerStyle}>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#c9302c",
                          fontWeight: "bold",
                          marginBottom: "8px",
                        }}
                      >
                        ENTER YOUR ANSWER BELOW:
                      </p>
                      <input
                        type="text"
                        placeholder="Type answer here..."
                        style={textInputStyle}
                        value={userAnswers[currentQuestionIndex] || ""}
                        onChange={(e) =>
                          dispatch(
                            selectOption({
                              index: currentQuestionIndex,
                              answer: e.target.value,
                            })
                          )
                        }
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Standard Loading State */
              <div className="exam-loader-container">
                <p
                  style={{
                    color: "#333",
                    fontSize: "13px",
                    marginBottom: "10px",
                    fontWeight: "bold",
                  }}
                >
                  PREPARING QUESTION DATA...
                </p>
                <div className="tcs-progress-bar">
                  <div className="tcs-progress-fill"></div>
                </div>
                <h3 className="loading-text-bold">Scanning Logic & Diagrams</h3>
              </div>
            )}
          </div>

          <footer style={footerStyle}>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                style={actionBtn("#fff", "#333")}
                onClick={() =>
                  setCurrentQuestionIndex((p) => Math.max(0, p - 1))
                }
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              <button
                style={actionBtn(colors.purpleMarked, "#fff", "none")}
                onClick={() =>
                  setMarkedForReview((p) =>
                    p.includes(currentQuestionIndex)
                      ? p.filter((i) => i !== currentQuestionIndex)
                      : [...p, currentQuestionIndex]
                  )
                }
              >
                {markedForReview.includes(currentQuestionIndex)
                  ? "Unmark Review"
                  : "Mark for Review"}
              </button>
            </div>
            <button
              style={actionBtn(
                currentQuestionIndex === questions.length - 1
                  ? "#286090"
                  : "#5cb85c",
                "#fff",
                "none"
              )}
              onClick={handleSaveAndNext}
            >
              {currentQuestionIndex === questions.length - 1
                ? "Submit Test"
                : "Save & Next"}
            </button>
          </footer>
        </div>

        <aside style={sidebarStyle}>
          <div style={candidateBoxStyle}>
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Amita"
              alt="User"
              style={photoStyle}
            />
            <div style={{ fontSize: "13px" }}>
              Candidate: <br />
              <strong>Amita</strong>
            </div>
          </div>

          <div style={paletteTitleStyle}>Question Palette</div>

          {/* NEW: Scrollable container for the grid */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              borderBottom: "1px solid #ccc",
            }}
          >
            <div style={paletteGridStyle}>
              {questions.map((_, i) => {
                let bgColor = colors.silverNotVisited;
                if (markedForReview.includes(i)) bgColor = colors.purpleMarked;
                else if (userAnswers[i]) bgColor = colors.greenAns;
                else if (
                  visitedQuestions.includes(i) &&
                  i !== currentQuestionIndex
                )
                  bgColor = colors.redNotAns;
                else if (i === currentQuestionIndex)
                  bgColor = colors.activeBlue;

                return (
                  <div
                    key={i}
                    onClick={() => setCurrentQuestionIndex(i)}
                    style={qShape(bgColor)}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              padding: "20px",
              background: "#fff",
            }}
          >
            <button onClick={handleFinalSubmit} style={submitBtnStyle}>
              SUBMIT TEST
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

// Styles (same as before)
const inputContainerStyle: React.CSSProperties = {
  padding: "20px",
  backgroundColor: "#fcfcfc",
  border: "1px solid #e0e0e0",
  borderRadius: "4px",
  marginTop: "10px",
};
const textInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 15px",
  fontSize: "18px",
  fontWeight: "bold",
  fontFamily: "monospace",
  border: "2px solid #337ab7",
  borderRadius: "4px",
  outline: "none",
  color: "#333",
};
const colors = {
  topHeader: "#286090",
  greenAns: "#2d8a2d",
  redNotAns: "#c9302c",
  purpleMarked: "#7e57c2",
  silverNotVisited: "#fff",
  activeBlue: "#337ab7",
};
const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  width: "100vw",
  position: "fixed",
  top: 0,
  left: 0,
  backgroundColor: "#fff",
};
const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "white",
  padding: "0 15px",
  height: "45px",
};
const timerBoxStyle: React.CSSProperties = {
  background: "#000",
  color: "#00ff00",
  padding: "4px 10px",
  fontFamily: "monospace",
  fontSize: "18px",
  border: "1px solid #444",
};
const sectionLabelStyle: React.CSSProperties = {
  padding: "10px 15px",
  background: "#f9f9f9",
  borderBottom: "1px solid #eee",
  fontWeight: "bold",
};
const sidebarStyle: React.CSSProperties = {
  width: "280px",
  background: "#e5e9ec",
  display: "flex",
  flexDirection: "column",
};
const leftPanelStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  borderRight: "1px solid #ccc",
};
const footerStyle: React.CSSProperties = {
  padding: "15px",
  borderTop: "1px solid #ccc",
  display: "flex",
  justifyContent: "space-between",
  background: "#f5f5f5",
};
const optionStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "12px",
  border: "1px solid #e5e7eb",
  borderRadius: "5px",
  cursor: "pointer",
  background: "#fff",
  marginBottom: "8px",
};
const paletteGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "8px",
  padding: "15px",
};
const paletteTitleStyle: React.CSSProperties = {
  background: "#337ab7",
  color: "#fff",
  padding: "5px 10px",
  fontSize: "12px",
};
const candidateBoxStyle: React.CSSProperties = {
  padding: "15px",
  background: "#fff",
  display: "flex",
  gap: "10px",
  borderBottom: "1px solid #ccc",
};
const photoStyle: React.CSSProperties = {
  width: "70px",
  height: "80px",
  border: "1px solid #999",
};
const submitBtnStyle = {
  width: "100%",
  backgroundColor: "#286090",
  color: "#fff",
  border: "none",
  padding: "10px",
  fontWeight: "bold" as const,
  cursor: "pointer",
  borderRadius: "3px",
};
const qShape = (bg: string) => ({
  width: "35px",
  height: "32px",
  backgroundColor: bg,
  color: bg === "#fff" ? "#333" : "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  borderRadius: bg === "#7e57c2" ? "50%" : "2px",
  border: bg === "#fff" ? "1px solid #999" : "none",
  cursor: "pointer",
});
const actionBtn = (bg: string, color: string, border = "1px solid #ccc") => ({
  backgroundColor: bg,
  color,
  border,
  padding: "10px 15px",
  fontSize: "13px",
  fontWeight: "bold" as const,
  cursor: "pointer",
  borderRadius: "3px",
});
const imageContainerStyle: React.CSSProperties = {
  margin: "15px 0",
  padding: "10px",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  backgroundColor: "#f9fafb",
  textAlign: "center",
};
