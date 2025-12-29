import React, { useState } from "react";
import "./Login.css";
import GovLogo from "../../../assets/login/task_bg.jpg"; // You'll need an official-looking logo
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../redux/store/store";
import { login } from "../../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Lock, User, Info } from "lucide-react";

const Login = () => {
  const navigation = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      const { access_token, user } = result.payload;
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      navigation("/dashboard");
    }
  };

  return (
    <div className="gov-exam-container">
      {/* Top Professional Header */}
      <header className="gov-header">
        <div className="header-content">
          <div className="logo-section">
            {/* Replace with a generic Gov Seal or Exam Board Logo */}
            <div className="gov-seal">NATIONAL EXAM PORTAL</div>
          </div>
          <div className="support-links">
            <span>
              <Info size={14} /> Help Desk
            </span>
            <span>Language: English</span>
          </div>
        </div>
      </header>

      <main className="gov-main">
        <div className="login-wrapper">
          {/* Security Advisory Panel */}
          <div className="advisory-panel">
            <h3>
              <ShieldAlert size={20} /> Candidate Advisory
            </h3>
            <ul>
              <li>
                Unauthorized access to this portal is a punishable offense.
              </li>
              <li>
                Please use the Registration ID provided during the application
                process.
              </li>
              <li>Ensure you are using a secure internet connection.</li>
            </ul>
          </div>

          {/* Actual Login Card */}
          <div className="gov-login-card">
            <div className="card-header">
              <Lock size={18} />
              <h2>Candidate Login</h2>
            </div>

            <form onSubmit={submit}>
              <div className="gov-input-group">
                <label>Login ID / Email</label>
                <div className="input-with-icon">
                  <User size={18} className="icon" />
                  <input
                    type="email"
                    placeholder="Enter Login ID"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="gov-input-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-footer">
                <button type="button" className="forgot-link"></button>
                <button type="submit" className="gov-signin-btn">
                  SIGN IN
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="gov-footer">
        <p>
          &copy; 2025 National Testing Agency. All rights reserved. Best viewed
          in Chrome 80+.
        </p>
      </footer>
    </div>
  );
};

export default Login;
