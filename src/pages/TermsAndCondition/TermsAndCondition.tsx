import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const TermsAndCondition = () => {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleBegin = () => {
    if (agreed) {
      // --- TRIGGER FULL SCREEN ---
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        /* Safari */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        /* IE11 */
        elem.msRequestFullscreen();
      }

      // --- NAVIGATE TO EXAM ---
      navigate("/QuestionSection");
    } else {
      alert("Please check the declaration box to proceed.");
    }
  };

  return (
    <div style={containerStyle}>
      {/* Blue Header */}
      <header style={headerStyle}>
        <span>Instructions</span>
      </header>

      {/* Main Content Area */}
      <div style={contentStyle}>
        <h3 style={{ borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
          General Instructions:
        </h3>

        <div style={scrollArea}>
          <ol>
            <li>
              The clock will be set at the server. The countdown timer in the
              top right corner of screen will display the remaining time
              available for you to complete the examination.
            </li>
            <li>
              The Question Palette displayed on the right side of screen will
              show the status of each question using one of the following
              symbols:
            </li>
          </ol>

          <div style={{ paddingLeft: "20px", fontSize: "13px" }}>
            <p>
              ✅ <strong>Answered:</strong> You have answered the question.
            </p>
            <p>
              🛑 <strong>Not Answered:</strong> You have not answered the
              question.
            </p>
            <p>
              ⚪ <strong>Not Visited:</strong> You have not visited the question
              yet.
            </p>
            <p>
              🟣 <strong>Marked for Review:</strong> You have not answered the
              question, but have marked the question for review.
            </p>
          </div>

          <h4>Navigating to a Question:</h4>
          <p>To answer a question, do the following:</p>
          <ul>
            <li>
              Click on the question number in the Question Palette to go to that
              numbered question directly.
            </li>
            <li>
              Click on <strong>Save & Next</strong> to save your answer for the
              current question and then go to the next question.
            </li>
            <li>
              Click on <strong>Mark for Review & Next</strong> to save your
              answer for the current question, mark it for review, and then go
              to the next question.
            </li>
          </ul>

          <p style={{ color: "red", fontWeight: "bold" }}>
            Caution: Note that your answer for the current question will not be
            saved, if you navigate to another question directly by clicking on
            its question number without clicking the Save & Next button.
          </p>
        </div>

        {/* Declaration Box */}
        <div style={footerSection}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "15px",
              background: "#f9f9f9",
              border: "1px solid #ddd",
            }}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={() => setAgreed(!agreed)}
              style={{ marginTop: "5px" }}
            />
            <p style={{ fontSize: "12px", margin: 0 }}>
              The instructions have been read and understood by me. All computer
              hardware allotted to me are in proper working condition. I agree
              that I am not in possession of any prohibited gadgets like mobile
              phones, bluetooth devices etc. / Any other material that is not
              allowed in the examination hall. I agree that in case of not
              adhering to the instructions, I shall be liable to be debarred
              from this Test and/or to disciplinary action, which may include
              ban from future Examinations.
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <footer style={actionFooter}>
        <button
          onClick={handleBegin}
          style={{
            ...beginBtn,
            backgroundColor: agreed ? "#286090" : "#ccc",
            cursor: agreed ? "pointer" : "not-allowed",
          }}
        >
          I AM READY TO BEGIN
        </button>
      </footer>
    </div>
  );
};

// --- STYLES ---
const containerStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  width: "100vw",
  backgroundColor: "#fff",
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 10000,
  fontFamily: "Arial",
};
const headerStyle = {
  background: "#286090",
  color: "#fff",
  padding: "10px 20px",
  fontSize: "16px",
  fontWeight: "bold",
};
const contentStyle = {
  flex: 1,
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};
const scrollArea = {
  flex: 1,
  overflowY: "auto",
  paddingRight: "10px",
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#333",
};
const footerSection = { marginTop: "20px" };
const actionFooter = {
  padding: "15px",
  borderTop: "1px solid #ccc",
  display: "flex",
  justifyContent: "center",
  background: "#f5f5f5",
};
const beginBtn = {
  color: "#fff",
  border: "none",
  padding: "12px 30px",
  fontSize: "14px",
  fontWeight: "bold",
  borderRadius: "3px",
};

export default TermsAndCondition;
