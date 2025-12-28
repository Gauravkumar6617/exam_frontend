import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  TrendingUp,
  Clock,
  Target,
  BarChart3,
  Zap,
  ChevronRight,
  AlertCircle,
  Award,
  BookOpen,
  BrainCircuit,
} from "lucide-react";

// --- SUB-COMPONENTS (Defined outside main component to prevent re-declaration) ---

const MetricCard = ({ icon, label, value, bg }: any) => (
  <div style={{ ...metricCardStyle, background: "white" }}>
    <div style={{ ...iconBox, backgroundColor: bg }}>{icon}</div>
    <div>
      <p style={metricLabel}>{label}</p>
      <h3 style={metricValue}>{value}</h3>
    </div>
  </div>
);

const SkillRow = ({ label, score, total, color }: any) => (
  <div style={{ marginBottom: "18px" }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "6px",
        fontSize: "14px",
        fontWeight: "600",
      }}
    >
      <span>{label}</span>
      <span style={{ color }}>
        {score}/{total}
      </span>
    </div>
    <div style={progressBarBg}>
      <div
        style={{
          ...progressBarFill,
          width: `${(score / total) * 100}%`,
          backgroundColor: color,
        }}
      />
    </div>
  </div>
);

const Progress = () => {
  // 2. Fallback: If no sectional data exists yet, show a friendly message

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/stats/dashboard-stats/Amita"
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={loaderStyle}>Analyzing Your Progress...</div>;
  if (!data || data.msg)
    return (
      <div style={loaderStyle}>
        No history found. Take a mock to see your stats!
      </div>
    );

  // --- DYNAMIC CALCULATIONS ---
  const totalAttempted =
    data.chart_data?.reduce(
      (acc: number, curr: any) => acc + (curr.attempted || 0),
      0
    ) || 0;
  const totalSeconds =
    data.chart_data?.reduce(
      (acc: number, curr: any) => acc + (curr.time_spent || 0),
      0
    ) || 1;
  const dynamicSpeed = ((totalAttempted / totalSeconds) * 60).toFixed(1);
  const isSafeZone = data.avg_score > 140;
  const sectional = data.latest_sectional || {};
  const lowSection =
    Object.keys(sectional).length > 0
      ? Object.keys(sectional).reduce((a, b) =>
          sectional[a] < sectional[b] ? a : b
        )
      : "General Awareness";
  const sectionalMarks = data.latest_sectional || {};
  const subjectNames = Object.keys(sectionalMarks);
  const hasSectionalData = subjectNames.length > 0;
  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        paddingBottom: "100px",
      }}
    >
      <header style={headerFlex}>
        <div>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: "900",
              color: "#111",
              margin: 0,
            }}
          >
            Performance Profile
          </h2>
          <p style={{ color: "#666" }}>
            Candidate ID: <strong>Amita</strong> | Mocks: {data.total_mocks}
          </p>
        </div>
        <div
          style={{
            ...qualificationBadge,
            backgroundColor: isSafeZone ? "#f0fdf4" : "#fef2f2",
            color: isSafeZone ? "#166534" : "#991b1b",
          }}
        >
          <Award size={18} /> {isSafeZone ? "Safe Zone" : "Improvement Needed"}
        </div>
      </header>

      <div style={kpiGrid}>
        <MetricCard
          icon={<Target color="#4f46e5" />}
          label="Avg. Accuracy"
          value={`${Math.round(data.avg_accuracy)}%`}
          bg="#eef2ff"
        />
        <MetricCard
          icon={<BarChart3 color="#059669" />}
          label="Avg. Score"
          value={data.avg_score}
          bg="#ecfdf5"
        />
        <MetricCard
          icon={<Clock color="#c2410c" />}
          label="Speed (Q/min)"
          value={dynamicSpeed}
          bg="#fff7ed"
        />
        <MetricCard
          icon={<Zap color="#dc2626" />}
          label="Last Score"
          value={data.chart_data?.slice(-1)[0]?.score || 0}
          bg="#fef2f2"
        />
      </div>

      <div style={mainGrid}>
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          <div style={contentBlock}>
            <div style={sectionHeader}>
              <BrainCircuit size={18} /> Skill Gap Analysis
            </div>
            <div style={{ padding: "20px" }}>
              {data.latest_sectional &&
              Object.keys(data.latest_sectional).length > 0 ? (
                Object.entries(data.latest_sectional).map(
                  ([subject, score]: [string, any]) => (
                    <SkillRow
                      key={subject}
                      label={subject.toUpperCase()} // Shows the exact name from database
                      score={score || 0}
                      total={50} // SSC Standard
                      color={
                        subject.toLowerCase().includes("gk")
                          ? "#ef4444"
                          : subject.toLowerCase().includes("math") ||
                            subject.toLowerCase().includes("arithmetic")
                          ? "#10b981"
                          : "#6366f1" // Default Blue
                      }
                    />
                  )
                )
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#666",
                  }}
                >
                  <p>No sectional data found in your last attempt.</p>
                </div>
              )}
            </div>
          </div>

          <div style={contentBlock}>
            <div style={sectionHeader}>
              <BrainCircuit size={18} /> Skill Gap Analysis
            </div>
            <div style={{ padding: "20px" }}>
              <SkillRow
                label="Logical Reasoning"
                score={sectional.reasoning || 0}
                total={50}
                color="#6366f1"
              />
              <SkillRow
                label="Quantitative Aptitude"
                score={sectional.arithmetic || 0}
                total={50}
                color="#10b981"
              />
              <SkillRow
                label="General Awareness"
                score={sectional.gk || 0}
                total={50}
                color="#ef4444"
              />
              <SkillRow
                label="English Language"
                score={sectional.english || 0}
                total={50}
                color="#f59e0b"
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          <div
            style={{
              ...contentBlock,
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              color: "#fff",
            }}
          >
            <div style={{ ...sectionHeader, color: "#fff" }}>
              ✨ Smart Prep Suggestions
            </div>
            <div style={{ padding: "20px" }}>
              <div style={insightItem}>
                <AlertCircle size={32} color="#fb7185" />
                <p>
                  Your <strong>{lowSection.toUpperCase()}</strong> is your
                  current bottleneck. Raise this to improve percentile.
                </p>
              </div>
            </div>
          </div>

          <div style={contentBlock}>
            <div style={sectionHeader}>
              <BookOpen size={18} /> Recent History
            </div>
            <div style={{ padding: "10px" }}>
              <table style={historyTable}>
                <thead>
                  <tr
                    style={{
                      textAlign: "left",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    <th>Date</th>
                    <th>Score</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {data.chart_data
                    .slice(-5)
                    .reverse()
                    .map((mock: any, i: number) => (
                      <tr key={i} style={tableRow}>
                        <td>{mock.date}</td>
                        <td>{mock.score}</td>
                        <td style={{ color: "#059669" }}>
                          {((mock.score / 200) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const getSubjectColor = (subject: string) => {
  const colors: any = {
    arithmetic: "#10b981",
    gk: "#ef4444",
    english: "#f59e0b",
    reasoning: "#6366f1",
    science: "#06b6d4",
    history: "#8b5cf6",
  };
  return colors[subject.toLowerCase()] || "#94a3b8"; // Default gray if subject is unknown
};
// --- STYLES ---
const headerFlex: any = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "40px",
};
const qualificationBadge: any = {
  padding: "10px 20px",
  borderRadius: "30px",
  fontSize: "14px",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};
const kpiGrid: any = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "20px",
  marginBottom: "30px",
};
const metricCardStyle: any = {
  padding: "20px",
  borderRadius: "20px",
  border: "1px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
  gap: "15px",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
};
const iconBox: any = {
  width: "50px",
  height: "50px",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const metricLabel = {
  margin: 0,
  fontSize: "13px",
  color: "#64748b",
  fontWeight: "600",
};
const metricValue = {
  margin: 0,
  fontSize: "24px",
  fontWeight: "900",
  color: "#0f172a",
};
const mainGrid: any = {
  display: "grid",
  gridTemplateColumns: "1.5fr 1fr",
  gap: "25px",
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
  borderBottom: "1px solid #f1f5f9",
  fontWeight: "800",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};
const graphContainer: any = { padding: "40px 20px 20px 20px", height: "250px" };
const barFrame: any = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-around",
  height: "180px",
  borderBottom: "2px solid #e2e8f0",
};
const barGroup: any = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flex: 1,
  position: "relative",
};
const bar: any = {
  width: "70%",
  borderRadius: "6px 6px 0 0",
  position: "relative" as "relative",
};
const barTooltip: any = {
  position: "absolute" as "absolute",
  top: "-25px",
  fontSize: "10px",
  fontWeight: "bold",
  background: "#334155",
  color: "#fff",
  padding: "2px 4px",
  borderRadius: "4px",
};
const barDate: any = { fontSize: "10px", color: "#94a3b8", marginTop: "10px" };
const insightItem: any = {
  display: "flex",
  gap: "15px",
  alignItems: "flex-start",
  marginBottom: "20px",
};
const historyTable: any = { width: "100%", borderCollapse: "collapse" };
const tableRow: any = { borderBottom: "1px solid #f1f5f9", height: "45px" };
const progressBarBg: any = {
  width: "100%",
  height: "8px",
  backgroundColor: "#f1f5f9",
  borderRadius: "10px",
};
const progressBarFill: any = { height: "100%", borderRadius: "10px" };
const loaderStyle: any = {
  height: "80vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  fontWeight: "600",
  color: "#666",
};

export default Progress;
