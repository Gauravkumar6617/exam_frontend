import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  LayoutDashboard,
  Lightbulb,
  ArrowLeft,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const Analysis = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("--- ANALYSIS SCREEN DEBUG ---");
    if (location.state) {
      console.log("Data Received Successfully", location.state);
    } else {
      console.error("No state found!");
    }
  }, [location]);

  const {
    allQuestions = [],
    userAnswers = {},
    correct = 0,
    wrong = 0,
    score = 0,
  } = location.state || {};

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("Exam Performance Report", 14, 22);

    // Summary Table
    autoTable(doc, {
      startY: 30,
      head: [["Metric", "Value"]],
      body: [
        ["Total Questions", allQuestions.length],
        ["Correct Answers", correct],
        ["Wrong Answers", wrong],
        ["Final Score", score.toFixed(2)],
      ],
      theme: "striped",
    });

    // Questions Table
    const tableRows = allQuestions.map((q, i) => {
      const uAns = userAnswers[i] || "Skipped";
      const cAns = q.answer || q.correctAnswer;
      const status =
        uAns === "Skipped"
          ? "Skipped"
          : uAns.trim().toLowerCase() === String(cAns).trim().toLowerCase()
          ? "Correct"
          : "Incorrect";

      return [i + 1, q.question, uAns, cAns, status];
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["#", "Question", "Your Answer", "Correct Answer", "Status"]],
      body: tableRows,
      columnStyles: {
        1: { cellWidth: 80 }, // Question column width
      },
    });

    doc.save(`Analysis_Report_${new Date().toLocaleDateString()}.pdf`);
  };
  return (
    <div style={analysisPage}>
      {/* HEADER: Removed position fixed to prevent overlapping */}
      <header style={analysisHeader}>
        <div style={headerTop}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={() => navigate(-1)} style={backIconBtn}>
              <ArrowLeft size={20} />
            </button>
            <h1 style={{ fontSize: "20px", margin: 0, color: "#1e293b" }}>
              Exam Review Analysis
            </h1>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {/* NEW DOWNLOAD BUTTON */}
            <button onClick={downloadPDF} style={downloadBtn}>
              <Download size={16} /> Download PDF
            </button>
            <button onClick={() => navigate("/Dashboard")} style={exitBtn}>
              <LayoutDashboard size={16} /> Exit
            </button>
          </div>
          <button onClick={() => navigate("/Dashboard")} style={exitBtn}>
            <LayoutDashboard size={16} /> Exit
          </button>
        </div>

        <div style={scoreStrip}>
          <div style={scoreItem}>
            <span style={miniLabel}>TOTAL SCORE</span>
            <strong style={{ fontSize: "20px" }}>{score.toFixed(2)}</strong>
          </div>
          <div style={scoreItem}>
            <span style={miniLabel}>CORRECT</span>
            <strong style={{ color: "#2d8a2d", fontSize: "20px" }}>
              {correct}
            </strong>
          </div>
          <div style={scoreItem}>
            <span style={miniLabel}>WRONG</span>
            <strong style={{ color: "#c9302c", fontSize: "20px" }}>
              {wrong}
            </strong>
          </div>
        </div>
      </header>

      {/* QUESTION LIST */}
      <main style={questionListContainer}>
        {allQuestions.length > 0 ? (
          allQuestions.map((q, i) => {
            const uAns = userAnswers[i];
            const cAns = q.answer || q.correctAnswer;
            const isSkipped = !uAns;
            const isCorrect =
              !isSkipped &&
              uAns.trim().toLowerCase() === String(cAns).trim().toLowerCase();

            return (
              <div
                key={i}
                style={{
                  ...qReviewBox,
                  borderLeft: isSkipped
                    ? "6px solid #94a3b8"
                    : isCorrect
                    ? "6px solid #2d8a2d"
                    : "6px solid #c9302c",
                }}
              >
                <div style={qHeader}>
                  <span style={qNumber}>QUESTION {i + 1}</span>
                  <div style={statusTag(isSkipped, isCorrect)}>
                    {isSkipped ? (
                      <HelpCircle size={14} />
                    ) : isCorrect ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}
                    {isSkipped
                      ? "SKIPPED"
                      : isCorrect
                      ? "CORRECT"
                      : "INCORRECT"}
                  </div>
                </div>

                <p style={qText}>{q.question}</p>

                <div style={answerCompareGrid}>
                  <div style={ansColumn}>
                    <span style={smallLabel}>YOUR ANSWER</span>
                    <div
                      style={{
                        color: isCorrect
                          ? "#2d8a2d"
                          : isSkipped
                          ? "#64748b"
                          : "#c9302c",
                        fontWeight: "700",
                      }}
                    >
                      {uAns || "Not Attempted"}
                    </div>
                  </div>
                  <div style={ansColumn}>
                    <span style={smallLabel}>CORRECT ANSWER</span>
                    <div style={{ color: "#2d8a2d", fontWeight: "700" }}>
                      {cAns}
                    </div>
                  </div>
                </div>

                {q.explanation && (
                  <div style={explanationBox}>
                    <div style={explTitle}>
                      <Lightbulb size={14} /> EXPLANATION
                    </div>
                    <div style={explContent}>{q.explanation}</div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <h2 style={{ color: "#64748b" }}>No analysis data found.</h2>
          </div>
        )}
      </main>
    </div>
  );
};

// --- STYLES ---
const analysisPage: React.CSSProperties = {
  backgroundColor: "#f1f5f9",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  fontFamily: "Inter, sans-serif",
};

const analysisHeader: React.CSSProperties = {
  backgroundColor: "#fff",
  borderBottom: "1px solid #e2e8f0",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  position: "sticky", // Stays at top but doesn't overlap
  top: 0,
  zIndex: 100,
};

const headerTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "15px 25px",
  borderBottom: "1px solid #f1f5f9",
};

const scoreStrip: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-around",
  padding: "15px 0",
  background: "#f8fafc",
};

const scoreItem: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "4px",
};

const miniLabel: React.CSSProperties = {
  fontSize: "10px",
  color: "#64748b",
  fontWeight: 800,
};

const questionListContainer: React.CSSProperties = {
  maxWidth: "900px",
  width: "100%",
  margin: "0 auto",
  padding: "30px 20px",
};

const qReviewBox: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  padding: "25px",
  marginBottom: "20px",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
};

const qHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "15px",
};

const qNumber: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 800,
  color: "#286090",
};

const downloadBtn: React.CSSProperties = {
  backgroundColor: "#10b981", // Green theme for download
  color: "#fff",
  border: "none",
  padding: "8px 16px",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};
const statusTag = (
  skipped: boolean,
  correct: boolean
): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "12px",
  fontWeight: "bold",
  color: skipped ? "#64748b" : correct ? "#2d8a2d" : "#c9302c",
});

const qText: React.CSSProperties = {
  fontSize: "17px",
  color: "#1e293b",
  lineHeight: "1.6",
  fontWeight: "500",
  marginBottom: "20px",
};

const answerCompareGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "15px",
  backgroundColor: "#f8fafc",
  padding: "15px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};

const ansColumn: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};

const smallLabel: React.CSSProperties = {
  fontSize: "11px",
  color: "#94a3b8",
  fontWeight: "bold",
};

const explanationBox: React.CSSProperties = {
  marginTop: "20px",
  padding: "15px",
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  border: "1px solid #dbeafe",
};

const explTitle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: "bold",
  color: "#1d4ed8",
  fontSize: "13px",
  marginBottom: "8px",
};

const explContent: React.CSSProperties = {
  fontSize: "14px",
  color: "#334155",
  lineHeight: "1.5",
};

const exitBtn: React.CSSProperties = {
  backgroundColor: "#286090",
  color: "#fff",
  border: "none",
  padding: "8px 16px",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const backIconBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#64748b",
};

export default Analysis;
