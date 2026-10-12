import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Study from "./components/Study";
import Community from "./components/Community";

export default function App() {
  const [activeTab, setActiveTab] = useState("study");

  return (
    <div className="navbar-app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1 }}>
        {activeTab === "study" && <Study />}
        {activeTab === "community" && <Community />}
      </main>
    </div>
  );
}
