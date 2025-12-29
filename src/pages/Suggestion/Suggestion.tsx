import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  Lightbulb,
  Target,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  RefreshCcw,
  History,
  Timer,
} from "lucide-react";

const Suggestion = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAIAnalysis = async () => {
      try {
        const response = await axios.get(
          "https://python-backend-z4tp.onrender.com/api/stats/dashboard-stats/Amita"
        );
        if (
          response.data &&
          !response.data.msg &&
          response.data.total_mocks > 0
        ) {
          setStats(response.data);
        } else {
          setStats(null);
        }
      } catch (error) {
        console.error("AI Analysis failed:", error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAIAnalysis();
  }, []);

  if (loading)
    return (
      <div style={loadingContainer}>
        <RefreshCcw className="spinner-icon" size={32} />
        <p style={{ marginTop: "15px" }}>
          ✨ AI Mentor is analyzing your exam history...
        </p>
      </div>
    );

  if (!stats)
    return (
      <div style={emptyContainer}>
        <div style={emptyCard}>
          <Target size={64} color="#94a3b8" />
          <h2 style={{ marginTop: "20px", color: "#1e293b" }}>
            No Performance Data
          </h2>
          <p
            style={{ color: "#64748b", maxWidth: "400px", margin: "15px auto" }}
          >
            Please complete a mock test to generate personalized AI suggestions.
          </p>
          <button onClick={() => navigate("/exam")} style={practiceBtn}>
            Go to Exam Portal{" "}
            <ArrowRight size={18} style={{ marginLeft: "8px" }} />
          </button>
        </div>
      </div>
    );

  // --- NEW SENSITIVE AI LOGIC ENGINE ---
  const sectional = stats.latest_sectional || {};
  const avgAcc = stats.avg_accuracy || 0;
  const avgScore = stats.avg_score || 0;
  const suggestions: any[] = [];

  // 1. Evaluate Quantitative Section
  const qScore = Number(sectional.arithmetic || 0);
  if (qScore > 0) {
    if (qScore < 15) {
      suggestions.push({
        cat: "Quantitative",
        topic: "Foundation Building",
        reason: `Your score (${qScore}/50) is very low. You need to master basic calculation before moving to complex topics.`,
        action: "Learn Vedic Math & Tables",
        priority: "Critical",
      });
    } else if (qScore < 35) {
      suggestions.push({
        cat: "Quantitative",
        topic: "Speed & Accuracy",
        reason:
          "You have a decent base but silly mistakes are draining your marks.",
        action: "Practice Algebra Level-1",
        priority: "High",
      });
    }
  }

  // 2. Evaluate GK Section
  const gkScore = Number(sectional.gk || 0);
  if (gkScore < 15) {
    suggestions.push({
      cat: "General Awareness",
      topic: "High-Yield Facts",
      reason: "Current GK knowledge is below the safety threshold for Tier-1.",
      action: "Revise Last 6 Months Current Affairs",
      priority: "High",
    });
  }

  // 3. Overall Strategy Fallback
  const masterStrategy =
    avgAcc > 80
      ? "Your accuracy is excellent. Focus on 'Speed Drills' to attempt more questions."
      : avgScore < 50
      ? "Stop focusing on speed. Spend more time understanding the question to avoid negative marks."
      : "Select questions wisely. Skip the 'Time Killers' and solve the easy ones first.";

  return (
    <div style={pageWrapper}>
      <header style={headerStyle}>
        <div>
          <h2 style={titleStyle}>
            <BrainCircuit size={36} color="#4f46e5" /> AI Mentor Insights
          </h2>
          <p style={{ color: "#666", marginTop: "5px" }}>
            Diagnostic based on <strong>{stats.total_mocks}</strong> attempt(s).
          </p>
        </div>
        <div style={readinessScore}>
          <span style={{ fontSize: "12px", color: "#666", fontWeight: "bold" }}>
            READINESS
          </span>
          <div style={scoreCircle}>{Math.round(avgAcc)}%</div>
        </div>
      </header>

      <div style={strategyBanner}>
        <div style={iconCircle}>
          <Zap size={24} color="#4f46e5" />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: "0 0 5px 0", color: "#1e1b4b" }}>
            Personalized Strategy
          </h4>
          <p style={strategyText}>{masterStrategy}</p>
        </div>
      </div>

      <div style={mainGrid}>
        <div style={contentBlock}>
          <div style={sectionHeader}>
            <AlertCircle size={18} color="#ef4444" /> Diagnostic Gap Analysis
          </div>
          <div style={{ padding: "20px" }}>
            {suggestions.length > 0 ? (
              suggestions.map((s, i) => (
                <WeakTopicCard
                  key={i}
                  category={s.cat}
                  topic={s.topic}
                  reason={s.reason}
                  action={s.action}
                  priority={s.priority}
                />
              ))
            ) : (
              <p
                style={{ textAlign: "center", color: "#666", padding: "20px" }}
              >
                Keep attempting mocks to unlock deeper analysis.
              </p>
            )}
          </div>
        </div>

        <div style={contentBlock}>
          <div style={sectionHeader}>
            <Target size={18} color="#10b981" /> 24-Hour Roadmap
          </div>
          <div style={{ padding: "20px" }}>
            <RoadmapTask
              task="Analyze Incorrect Answers from Last Mock"
              done={false}
            />
            {avgAcc < 75 && (
              <RoadmapTask task="Revise Core Concepts (Theory)" done={false} />
            )}
            <RoadmapTask task="Solve 10 Previous Year Questions" done={true} />
            <div style={resourceBox}>
              <h5 style={resourceTitle}>
                <Lightbulb size={16} color="#f59e0b" /> Insight
              </h5>
              <p style={{ margin: 0, fontSize: "13px", color: "#92400e" }}>
                "Since your accuracy is only {Math.round(avgAcc)}%, focus on
                conceptual clarity today."
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer style={footerStyle}>
        <div style={footerItem}>
          <History size={18} /> Avg Score: <strong>{avgScore}</strong>
        </div>
        <div style={footerItem}>
          <Timer size={18} /> Status:{" "}
          <strong>{avgScore < 50 ? "Learning" : "Competitive"}</strong>
        </div>
      </footer>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner-icon { animation: spin 2s linear infinite; color: #4f46e5; }
      `}</style>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const WeakTopicCard = ({ category, topic, reason, action, priority }: any) => (
  <div style={weakTopicCardStyle}>
    <div style={cardTop}>
      <span style={categoryTag}>{category}</span>
      <span
        style={{
          fontSize: "10px",
          fontWeight: "800",
          color: priority === "Critical" ? "#dc2626" : "#f59e0b",
        }}
      >
        {priority} Priority
      </span>
    </div>
    <h4 style={topicTitle}>{topic}</h4>
    <p style={reasonText}>{reason}</p>
    <button style={practiceBtnSmall}>{action}</button>
  </div>
);

const RoadmapTask = ({ task, done }: any) => (
  <div style={{ ...taskItem, opacity: done ? 0.5 : 1 }}>
    {done ? <CheckCircle size={20} color="#10b981" /> : <div style={dot} />}
    <span
      style={{
        fontSize: "14px",
        textDecoration: done ? "line-through" : "none",
      }}
    >
      {task}
    </span>
  </div>
);

// --- STYLES ---
const pageWrapper: any = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "20px",
  paddingBottom: "100px",
};
const loadingContainer: any = {
  height: "80vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  color: "#666",
};
const emptyContainer: any = {
  height: "80vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};
const emptyCard: any = {
  background: "#fff",
  padding: "60px",
  borderRadius: "32px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};
const headerStyle: any = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "40px",
};
const titleStyle: any = {
  fontSize: "32px",
  fontWeight: "900",
  color: "#1e293b",
  display: "flex",
  alignItems: "center",
  gap: "15px",
  margin: 0,
};
const readinessScore: any = {
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};
const scoreCircle: any = {
  width: "65px",
  height: "65px",
  borderRadius: "50%",
  border: "5px solid #4f46e5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "900",
  fontSize: "18px",
  color: "#4f46e5",
};
const strategyBanner: any = {
  background: "#fff",
  padding: "25px",
  borderRadius: "24px",
  marginBottom: "30px",
  display: "flex",
  alignItems: "center",
  gap: "25px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
};
const strategyText: any = {
  margin: 0,
  color: "#475569",
  fontSize: "15px",
  lineHeight: "1.6",
};
const mainGrid: any = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr",
  gap: "30px",
};
const contentBlock: any = {
  background: "white",
  borderRadius: "24px",
  border: "1px solid #e2e8f0",
  overflow: "hidden",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
};
const sectionHeader: any = {
  padding: "18px 24px",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  fontWeight: "800",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};
const weakTopicCardStyle: any = {
  padding: "20px",
  borderRadius: "16px",
  backgroundColor: "#fff",
  border: "1px solid #f1f5f9",
  marginBottom: "20px",
};
const cardTop: any = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "12px",
};
const categoryTag: any = {
  fontSize: "10px",
  fontWeight: "800",
  textTransform: "uppercase",
  padding: "4px 10px",
  borderRadius: "6px",
  backgroundColor: "#f1f5f9",
  color: "#475569",
};
const topicTitle: any = {
  margin: "0 0 8px 0",
  fontSize: "18px",
  fontWeight: "700",
  color: "#1e293b",
};
const reasonText: any = {
  margin: "0 0 15px 0",
  fontSize: "14px",
  color: "#64748b",
  lineHeight: "1.5",
};
const practiceBtn: any = {
  background: "#4f46e5",
  border: "none",
  color: "#fff",
  padding: "14px 28px",
  borderRadius: "12px",
  fontWeight: "700",
  fontSize: "15px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};
const practiceBtnSmall: any = {
  background: "#f1f5f9",
  border: "1px solid #e2e8f0",
  color: "#4f46e5",
  padding: "8px 12px",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "12px",
  cursor: "pointer",
};
const taskItem: any = {
  display: "flex",
  gap: "15px",
  marginBottom: "20px",
  alignItems: "center",
  fontWeight: "500",
};
const dot: any = {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  backgroundColor: "#4f46e5",
};
const resourceBox: any = {
  marginTop: "30px",
  padding: "20px",
  backgroundColor: "#fffbeb",
  borderRadius: "16px",
  border: "1px solid #fef3c7",
};
const resourceTitle: any = {
  margin: "0 0 10px 0",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontWeight: "800",
  color: "#92400e",
};
const footerStyle: any = {
  marginTop: "40px",
  display: "flex",
  gap: "30px",
  padding: "20px",
  borderTop: "1px solid #e2e8f0",
};
const footerItem: any = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "14px",
  color: "#64748b",
};
const iconCircle: any = {
  width: "60px",
  height: "60px",
  background: "#f5f3ff",
  borderRadius: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default Suggestion;
