import React, { useState, useEffect } from "react";
import { Send } from "lucide-react";
import io from "socket.io-client";
import "./Community.css";

//onst API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io("https://bewise-backend.onrender.com");

export default function Community() {
  const [messages, setMessages] = useState(() => {
    const savedChats = localStorage.getItem("bewise_community_live_chats");
    if (savedChats) {
      try {
        return JSON.parse(savedChats);
      } catch (e) {
        console.error("Failed to parse saved chats", e);
      }
    }
    return [];
  });

  const [inputText, setInputText] = useState("");

  useEffect(() => {
    socket.on("receive-message", (newMessage) => {
      setMessages((prev) => {
        const updated = [...prev, newMessage];
        localStorage.setItem(
          "bewise_community_live_chats",
          JSON.stringify(updated),
        );
        return updated;
      });
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      socketId: socket.id,
    };

    socket.emit("send-message", newMessage);
    setInputText("");
  };

  return (
    <div className="community-container">
      <div className="study-hero">
        <h1 className="study-title">
          Student <span className="study-title-highlight">Community Feed</span>
        </h1>
        <p className="study-subtitle">
          Live chat, share ideas, and discuss study notes with peers in
          real-time.
        </p>
      </div>

      <div className="community-chat-box">
        <div className="chat-feed">
          {messages.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#64748b",
                margin: "auto",
                fontSize: "0.9rem",
              }}
            >
              No messages yet. Start the live conversation below!
            </div>
          ) : (
            messages.map((msg) => {
              const isOutgoing = msg.socketId === socket.id;
              return (
                <div
                  key={msg.id}
                  className={`chat-message-row ${isOutgoing ? "outgoing" : "incoming"}`}
                >
                  <div className="chat-message-bubble">{msg.text}</div>
                  <span className="chat-message-time">{msg.time}</span>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="text"
            placeholder="Type a live message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="chat-input"
          />
          <button type="submit" className="chat-send-btn">
            <Send style={{ width: "1rem", height: "1rem" }} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
