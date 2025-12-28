import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import ProtectedRoute from "../component/ProtectedRoutes";
import PublicRoute from "../component/PublicRoute";
import { SSCExamInterface } from "../pages/Exam/Layout/Layout";
import PreExam from "../pages/Exam/PreExam/PreExam";
import Progress from "../pages/Progress/Progress";
import Suggestion from "../pages/Suggestion/Suggestion";
import TermsAndCondition from "../pages/TermsAndCondition/TermsAndCondition";
import SubmittedScreen from "../pages/SubmittedScreen/SubmittedScreen";
import Analysis from "../pages/Analysis/Analysis";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* PUBLIC (BLOCK WHEN LOGGED IN) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* PROTECTED */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/QuestionSection" Component={SSCExamInterface} />
      <Route path="/preExam" Component={PreExam} />
      <Route path="/progress" Component={Progress} />
      <Route path="/suggestion" Component={Suggestion} />
      <Route path="/TandC" Component={TermsAndCondition} />
      <Route path="/SubmittedScreen" Component={SubmittedScreen} />
      <Route path="/Analysis" Component={Analysis} />
    </Routes>
  );
}
