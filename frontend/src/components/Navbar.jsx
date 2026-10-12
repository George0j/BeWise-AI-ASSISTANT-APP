import React from "react";
import { BookOpen, Users, Sparkles, User } from "lucide-react";
import "./Navbar.css";

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="navbar-header">
      <div className="navbar-content">
        <div className="navbar-logo">
          <div className="navbar-logo-icon">
            <Sparkles
              style={{ width: "1.25rem", height: "1.25rem", color: "#ffffff" }}
            />
          </div>
          <div className="navbar-brand-group">
            <span className="navbar-brand-text">Bewise</span>
            <span className="navbar-badge">AI</span>
          </div>
        </div>

        {/* Centered Navigation Tabs */}
        <div className="navbar-center-nav">
          <nav className="navbar-nav-list">
            <button
              onClick={() => setActiveTab("study")}
              className={`navbar-nav-btn ${activeTab === "study" ? "active" : ""}`}
            >
              <BookOpen style={{ width: "1rem", height: "1rem" }} />
              <span>Study</span>
            </button>

            <button
              onClick={() => setActiveTab("community")}
              className={`navbar-nav-btn ${activeTab === "community" ? "active" : ""}`}
            >
              <Users style={{ width: "1rem", height: "1rem" }} />
              <span>Community</span>
            </button>
          </nav>
        </div>

        {/* Right Utilities Section */}
        <div className="navbar-utilities">
          <div className="navbar-status-pill">
            <span className="status-dot"></span>
            <span>AI Active</span>
          </div>
          <button className="navbar-user-btn">
            <User style={{ width: "1rem", height: "1rem" }} />
          </button>
        </div>
      </div>
    </header>
  );
}
