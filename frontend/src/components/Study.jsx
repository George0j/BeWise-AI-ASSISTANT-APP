import React, { useState } from "react";
import {
  Upload,
  FileCheck,
  Sparkles,
  RefreshCw,
  Download,
  BookOpen,
} from "lucide-react";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";
import "./study.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const API_BASE_URL =
  "https://bewise-backend.onrender.com" || "http://localhost:5000";

export default function Study() {
  const [outlineText, setOutlineText] = useState("");
  const [fileName, setFileName] = useState("");
  const [subject, setSubject] = useState("");
  const [detailLevel] = useState("concise");
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [notes, setNotes] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const processingSteps = [
    "Extracting text from uploaded document...",
    "Transmitting outline to Gemini AI Engine...",
    "Parsing syllabus structure & core exam modules...",
    "Compiling concise, high-yield revision notes...",
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg("");

    try {
      if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setOutlineText(result.value);
      } else if (file.name.endsWith(".pdf")) {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;
        let fullText = "";

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(" ");
          fullText += pageText + "\n\n";
        }
        setOutlineText(fullText);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          setOutlineText(event.target.result || "");
        };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error("File parsing error:", err);
      setErrorMsg(
        "Failed to parse document text. Try pasting your syllabus text directly.",
      );
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!outlineText && !subject) return;

    setIsGenerating(true);
    setStepIndex(0);
    setErrorMsg("");

    const interval = setInterval(() => {
      setStepIndex((prev) =>
        prev < processingSteps.length - 1 ? prev + 1 : prev,
      );
    }, 1500);

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          outlineText,
          subject,
          detailLevel,
        }),
      });

      clearInterval(interval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate study notes.");
      }

      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.message ||
          "Could not connect to backend server. Make sure your server is running.",
      );
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!notes) return;

    const doc = new jsPDF();
    let yPosition = 20;
    const pageWidth = 190;
    const pageHeight = 280;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(notes.title || "Study Notes", 15, yPosition);
    yPosition += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(notes.subtitle || "", 15, yPosition);
    yPosition += 6;
    doc.text(`AI Readiness Score: ${notes.readinessScore}`, 15, yPosition);
    yPosition += 12;

    doc.setTextColor(0);

    notes.modules?.forEach((m, index) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Module ${index + 1}: ${m.name} (${m.weight})`, 15, yPosition);
      yPosition += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitOverview = doc.splitTextToSize(
        m.lectureContent || "",
        pageWidth,
      );
      doc.text(splitOverview, 15, yPosition);
      yPosition += splitOverview.length * 5 + 4;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Key Exam Insights:", 15, yPosition);
      yPosition += 5;

      doc.setFont("helvetica", "normal");
      m.keyPoints?.forEach((pt) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        const bulletText = `• ${pt}`;
        const splitBullet = doc.splitTextToSize(bulletText, pageWidth - 5);
        doc.text(splitBullet, 18, yPosition);
        yPosition += splitBullet.length * 5 + 2;
      });

      yPosition += 8;
    });

    const fileNameSafe = (notes.title || "study_notes")
      .toLowerCase()
      .replace(/\s+/g, "_");
    doc.save(`${fileNameSafe}_master_notes.pdf`);
  };

  return (
    <div className="study-container">
      <div className="study-hero">
        <h1 className="study-title">
          Course Outline{" "}
          <span className="study-title-highlight">AI Synthesizer</span>
        </h1>
        <p className="study-subtitle">
          Upload your syllabus (.docx, .pdf, .txt) or paste course details to
          generate concise, high-yield study notes.
        </p>
      </div>

      {errorMsg && (
        <div className="study-error-banner">
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      {!notes ? (
        <div style={{ maxWidth: "48rem", margin: "0 auto" }}>
          <div className="study-card">
            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label className="form-label">Subject / Course Name</label>
                <input
                  type="text"
                  placeholder="e.g., Artificial Intelligence & Neural Networks"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Upload Outline Document</label>
                <label className="upload-dropzone">
                  <div className="upload-icon-box">
                    <Upload style={{ width: "1.5rem", height: "1.5rem" }} />
                  </div>
                  <span className="upload-text">
                    {fileName ? (
                      <span className="upload-file-name">
                        <FileCheck style={{ width: "1rem", height: "1rem" }} />{" "}
                        {fileName}
                      </span>
                    ) : (
                      "Click to choose file or drag & drop"
                    )}
                  </span>
                  <span className="upload-subtext">
                    Supports PDF, DOCX, TXT files
                  </span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".txt,.pdf,.docx"
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Or Paste Course Syllabus Content
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste syllabus modules, lecture titles, or topics here..."
                  value={outlineText}
                  onChange={(e) => setOutlineText(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || (!outlineText && !subject)}
                className="btn-generate"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw
                      style={{ width: "1rem", height: "1rem" }}
                      className="animate-spin"
                    />
                    <span>Synthesizing with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles style={{ width: "1rem", height: "1rem" }} />
                    <span>Generate AI Master Notes</span>
                  </>
                )}
              </button>
            </form>

            {isGenerating && (
              <div className="processing-card">
                <span className="processing-step-label">
                  Step {stepIndex + 1} of {processingSteps.length}
                </span>
                <div className="step-text">{processingSteps[stepIndex]}</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="viewer-header">
            <div>
              <h2 className="viewer-title">{notes.title}</h2>
              <span className="viewer-readiness">
                AI Readiness Score: {notes.readinessScore}
              </span>
            </div>
            <div className="viewer-actions">
              <button onClick={handleDownloadPdf} className="btn-secondary">
                <Download
                  style={{ width: "1rem", height: "1rem", color: "#34d399" }}
                />
                <span>Download PDF</span>
              </button>
              <button onClick={() => setNotes(null)} className="btn-secondary">
                <BookOpen style={{ width: "1rem", height: "1rem" }} />
                <span>Upload Another</span>
              </button>
            </div>
          </div>

          <div className="notes-stack">
            {notes.modules?.map((m) => (
              <div key={m.id} className="study-card">
                <div className="module-header-row">
                  <h3 className="note-section-title">{m.name}</h3>
                  <span className="module-weight-badge">{m.weight}</span>
                </div>

                <p className="lecture-content-text">{m.lectureContent}</p>

                <div className="key-points-container">
                  <strong className="key-points-heading">
                    Key Exam Insights
                  </strong>
                  {m.keyPoints?.map((pt, i) => (
                    <div key={i} className="note-bullet">
                      • {pt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
