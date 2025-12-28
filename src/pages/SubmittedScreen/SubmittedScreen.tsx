import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, ArrowLeft, BarChart3, Medal } from "lucide-react";

const SubmittedScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Log to verify exactly what arrived from the Exam Interface
  console.log("🕵️ SubmittedScreen State Check:", location.state);

  // 1. EXTRACT DATA (Using aliases to prevent undefined errors)
  const {
    total_questions = 0,
    attempted = 0,
    topic = "General Mock Test",
    user_id = "GAURAV KUMAR",
    score = 0, // Captured from payload
    accuracy = 0, // Captured from payload
    correct = 0,
    wrong = 0,
  } = location.state || {};

  // 2. DYNAMIC CALCULATIONS
  const skippedCount = total_questions - attempted;

  const handleViewAnalysis = () => {
    navigate("/Analysis", { state: location.state });
  };

  return (
    <div style={fullPageOverlay}>
      <div style={summaryContainer}>
        {/* Success Header */}
        <div style={successHeader}>
          <CheckCircle size={48} color="#fff" />
          <h2 style={{ margin: "10px 0 0 0" }}>Exam Submitted Successfully!</h2>
          <p style={{ opacity: 0.9, fontSize: "14px", marginTop: "5px" }}>
            {topic}
          </p>
        </div>

        {/* Score Highlight Section */}
        <div style={scoreHighlight}>
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                margin: 0,
                color: "#666",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              FINAL SCORE
            </p>
            <h1 style={{ margin: 0, fontSize: "48px", color: "#286090" }}>
              {score}
            </h1>
          </div>
          <div
            style={{ height: "50px", width: "1px", backgroundColor: "#ddd" }}
          ></div>
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                margin: 0,
                color: "#666",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              ACCURACY
            </p>
            <h1 style={{ margin: 0, fontSize: "48px", color: "#059669" }}>
              {accuracy}%
            </h1>
          </div>
        </div>

        {/* Candidate Info Grid */}
        <div style={infoGrid}>
          <div style={infoItem}>
            <strong>Candidate:</strong> {user_id}
          </div>
          <div style={infoItem}>
            <strong>Status:</strong>{" "}
            <span style={{ color: "#059669" }}>Completed</span>
          </div>
          <div style={infoItem}>
            <strong>Correct:</strong> {correct}
          </div>
          <div style={infoItem}>
            <strong>Incorrect:</strong> {wrong}
          </div>
        </div>

        {/* Summary Table */}
        <div style={tableWrapper}>
          <table style={summaryTable}>
            <tbody>
              <tr style={tableRow}>
                <td style={tdLabel}>Total Questions</td>
                <td style={tdValue}>{total_questions}</td>
              </tr>
              <tr style={tableRow}>
                <td style={tdLabel}>Attempted</td>
                <td style={{ ...tdValue, color: "#286090" }}>{attempted}</td>
              </tr>
              <tr style={tableRow}>
                <td style={tdLabel}>Skipped</td>
                <td style={{ ...tdValue, color: "#c9302c" }}>
                  {skippedCount < 0 ? 0 : skippedCount}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div style={actionArea}>
          <button onClick={() => navigate("/dashboard")} style={backBtn}>
            <ArrowLeft size={18} /> Dashboard
          </button>
          <button onClick={handleViewAnalysis} style={analysisBtn}>
            <BarChart3 size={18} /> Detailed Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

// --- NEW STYLES FOR HIGHLIGHTING ---
const scoreHighlight: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  padding: "30px",
  background: "#fff",
  borderBottom: "1px solid #eee",
};

const tdLabel = {
  padding: "12px",
  border: "1px solid #dee2e6",
  background: "#f8f9fa",
  fontWeight: "600" as const,
};
const tdValue = {
  padding: "12px",
  border: "1px solid #dee2e6",
  textAlign: "center" as const,
  fontWeight: "700" as const,
};
// --- STYLES (Unchanged, but kept for completeness) ---
const fullPageOverlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "#f0f2f5",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10000,
  fontFamily: "Arial, sans-serif",
};

const summaryContainer: React.CSSProperties = {
  width: "90%",
  maxWidth: "700px",
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  overflow: "hidden",
};

const successHeader: React.CSSProperties = {
  background: "#286090",
  color: "#fff",
  padding: "30px",
  textAlign: "center",
};

const infoGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "15px",
  padding: "20px",
  background: "#f8f9fa",
  borderBottom: "1px solid #eee",
  fontSize: "14px",
};

const infoItem = { color: "#444" };
const tableWrapper = { padding: "20px 30px" };
const summaryTable: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px",
};
const tableHeaderRow = { background: "#e9ecef" };
const thStyle = {
  padding: "12px",
  border: "1px solid #dee2e6",
  textAlign: "left" as const,
};
const tdStyle = { padding: "12px", border: "1px solid #dee2e6" };
const tableRow = { borderBottom: "1px solid #eee" };
const footerNote: React.CSSProperties = {
  textAlign: "center",
  padding: "0 25px 20px 25px",
  color: "#666",
  fontSize: "13px",
};
const actionArea: React.CSSProperties = {
  padding: "20px",
  display: "flex",
  justifyContent: "center",
  gap: "15px",
  borderTop: "1px solid #eee",
};

const backBtn: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontWeight: "bold",
};

const analysisBtn: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: "6px",
  border: "none",
  background: "#286090",
  color: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontWeight: "bold",
};

export default SubmittedScreen;
