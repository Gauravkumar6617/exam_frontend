import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { useGetUsersQuery } from "../../services/userApi";
import Loader from "../../component/Loader/Loader";
import { logout } from "../../features/auth/authSlice";
import type { AppDispatch } from "../../redux/store/store";
import PreExam from "../Exam/PreExam/PreExam";
import Progress from "../Progress/Progress";
import Suggestion from "../Suggestion/Suggestion";
import { SSCExamInterface } from "../Exam/Layout/Layout";
import { useDispatch } from "react-redux";
import {
  LayoutDashboard,
  FileEdit,
  TrendingUp,
  Lightbulb,
  LogOut,
  UserCircle,
  Bell,
  Calendar,
  ShieldCheck,
} from "lucide-react";

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [user, setUser] = useState<any>(null);
  const [activeView, setActiveView] = useState<
    "dashboard" | "mock-test" | "Progress" | "Suggestion" | "live-exam"
  >("dashboard");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => dispatch(logout());
  const { data, isLoading, error } = useGetUsersQuery();

  if (isLoading || error) return <Loader />;

  return (
    <div className="gov-dashboard-container">
      {/* --- OFFICIAL SIDEBAR --- */}
      <aside className="gov-sidebar">
        <div className="gov-user-profile">
          <UserCircle size={64} color="#cbd5e1" />
          <div className="user-info">
            <span className="user-name">{user?.full_name || "Amita"}</span>
            <span className="user-id">Candidate ID: 20250912</span>
          </div>
        </div>

        <nav className="gov-nav">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Candidate Dashboard"
            active={activeView === "dashboard"}
            onClick={() => setActiveView("dashboard")}
          />
          <NavItem
            icon={<FileEdit size={20} />}
            label="Online Mock Test"
            active={activeView === "mock-test"}
            onClick={() => setActiveView("mock-test")}
          />
          <NavItem
            icon={<TrendingUp size={20} />}
            label="Performance Graph"
            active={activeView === "Progress"}
            onClick={() => setActiveView("Progress")}
          />
          <NavItem
            icon={<Lightbulb size={20} />}
            label="AI Recommendations"
            active={activeView === "Suggestion"}
            onClick={() => setActiveView("Suggestion")}
          />
        </nav>

        <div className="gov-sidebar-footer">
          <div className="security-badge">
            <ShieldCheck size={14} /> Secure Portal
          </div>
          <button className="logout-btn-official" onClick={handleLogout}>
            <LogOut size={16} /> Exit Portal
          </button>
        </div>
      </aside>

      {/* --- MAIN PORTAL VIEWPORT --- */}
      <main className="gov-viewport">
        {activeView === "dashboard" && (
          <div className="portal-content">
            <header className="portal-header">
              <div className="header-text">
                <h1>Welcome, {user?.full_name || "Amita"}</h1>
                <p>SSC CGL / CHSL Examination Board - Candidate Home</p>
              </div>
              <div className="portal-actions">
                <div className="notification-icon">
                  <Bell size={22} />
                  <span className="badge-count">2</span>
                </div>
              </div>
            </header>

            <div className="alert-banner">
              <strong>OFFICIAL ADVISORY:</strong> Tier-1 Mock Tests are updated
              based on the 2025 pattern. Ensure your internet connection is
              stable before starting.
            </div>

            {/* THE STATS GRID - Fixed "Disfigure" issue */}
            <div className="gov-stats-grid">
              <StatCard
                label="Overall Accuracy"
                value="92%"
                sub="Top 5% of Candidates"
                color="#10b981"
                border="#10b981"
              />
              <StatCard
                label="Recent Mock Score"
                value="142.5/200"
                sub="Attempted on 24 Dec"
                color="#6366f1"
                border="#6366f1"
              />
              <StatCard
                label="Expected Percentile"
                value="96.4"
                sub="Category: Tier-1 Safe"
                color="#f59e0b"
                border="#f59e0b"
              />
            </div>

            <div className="portal-info-layout">
              {/* Upcoming Exams Section */}
              <section className="info-panel">
                <div className="panel-header">
                  <Calendar size={18} /> <h3>Examination Schedule</h3>
                </div>
                <div className="exam-row">
                  <span>SSC CGL Tier-1</span>
                  <strong>March 15, 2025</strong>
                </div>
                <div className="exam-row">
                  <span>IBPS PO Prelims</span>
                  <strong>April 02, 2025</strong>
                </div>
                <div className="exam-row">
                  <span>SSC CHSL Tier-1</span>
                  <strong>May 12, 2025</strong>
                </div>
              </section>

              {/* Diagnostic Box */}
              <section className="info-panel diagnostic-box">
                <div className="panel-header">
                  <TrendingUp size={18} /> <h3>Diagnostic Analysis</h3>
                </div>
                <p>
                  System analysis indicates your{" "}
                  <strong>General Awareness</strong> score is 12% below the
                  required safety threshold for Tier-1.
                </p>
                <button
                  className="gov-primary-btn"
                  onClick={() => setActiveView("Suggestion")}
                >
                  View Recovery Plan
                </button>
              </section>
            </div>
          </div>
        )}

        {/* --- DYNAMIC VIEW LOADER --- */}
        {activeView === "mock-test" && (
          <PreExam onStart={() => setActiveView("live-exam")} />
        )}
        {activeView === "Progress" && <Progress />}
        {activeView === "Suggestion" && <Suggestion />}

        {/* --- LIVE EXAM OVERLAY --- */}
        {activeView === "live-exam" && (
          <div className="exam-fullscreen-overlay">
            <SSCExamInterface onFinish={() => setActiveView("Progress")} />
          </div>
        )}
      </main>
    </div>
  );
};

// --- HELPER COMPONENTS ---
const NavItem = ({ icon, label, active, onClick }: any) => (
  <a
    href="#"
    className={`gov-nav-item ${active ? "active" : ""}`}
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
  >
    {icon} <span>{label}</span>
  </a>
);

const StatCard = ({ label, value, sub, color, border }: any) => (
  <div className="gov-stat-card" style={{ borderTop: `4px solid ${border}` }}>
    <p className="card-label">{label}</p>
    <h2 className="card-value" style={{ color }}>
      {value}
    </h2>
    <p className="card-subtext">{sub}</p>
  </div>
);

export default Dashboard;
