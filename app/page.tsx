"use client";

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ChildDetails, StoryPayload, THEMES, Theme } from "@/lib/types";

type Step = "welcome" | "details" | "theme" | "review" | "loading" | "finished";

const initialData: ChildDetails = {
  childName: "",
  age: "",
  favoriteAnimal: "",
  favoriteColor: "",
  dedication: "",
  theme: THEMES[0]
};

export default function HomePage() {
  const [step, setStep] = useState<Step>("welcome");
  const [formData, setFormData] = useState<ChildDetails>(initialData);
  const [story, setStory] = useState<StoryPayload | null>(null);
  const [source, setSource] = useState<"mock" | "claude" | null>(null);
  const [error, setError] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);

  const flowIndex = useMemo(() => {
    const order: Step[] = ["welcome", "details", "theme", "review", "loading", "finished"];
    return order.indexOf(step);
  }, [step]);

  const canContinueFromDetails =
    formData.childName && formData.age && formData.favoriteAnimal && formData.favoriteColor && formData.dedication;

  async function generateStory() {
    setStep("loading");
    setError("");

    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Story generation failed");

      const payload = await response.json();
      setStory(payload.story);
      setSource(payload.source);
      setStep("finished");
    } catch (err) {
      setError("Something went wrong while creating this story. Please try again.");
      setStep("review");
    }
  }

  async function downloadPrintFile() {
    if (!story) return;
    setIsDownloading(true);

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...story, childName: formData.childName })
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${formData.childName || "little-gem-book"}.pdf`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <main className="container">
      <section className="panel">
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className={`progress-dot ${idx <= flowIndex ? "active" : ""}`} />
          ))}
        </div>

        {step === "welcome" && (
          <>
            <p style={{ color: "#4f46e5", fontWeight: 700, letterSpacing: "0.06em" }}>LITTLE GEM BOOKS</p>
            <h1 style={{ fontSize: "2.3rem" }}>Personalized storybooks made just for your child</h1>
            <p style={{ color: "#6a6a82" }}>Create a magical printed keepsake in minutes at the cart.</p>
            <div className="actions">
              <button className="primary-btn" onClick={() => setStep("details")}>Create Your Story</button>
            </div>
          </>
        )}

        {step === "details" && (
          <>
            <h2>Tell us about your child</h2>
            <div className="grid-2">
              <label>Child name<input className="input" value={formData.childName} onChange={(e) => setFormData({ ...formData, childName: e.target.value })} /></label>
              <label>Age<input className="input" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} /></label>
              <label>Favorite animal<input className="input" value={formData.favoriteAnimal} onChange={(e) => setFormData({ ...formData, favoriteAnimal: e.target.value })} /></label>
              <label>Favorite color<input className="input" value={formData.favoriteColor} onChange={(e) => setFormData({ ...formData, favoriteColor: e.target.value })} /></label>
            </div>
            <label>Dedication from parent<textarea className="input" style={{ minHeight: 110 }} value={formData.dedication} onChange={(e) => setFormData({ ...formData, dedication: e.target.value })} /></label>
            <div className="actions">
              <button className="secondary-btn" onClick={() => setStep("welcome")}>Back</button>
              <button className="primary-btn" disabled={!canContinueFromDetails} onClick={() => setStep("theme")}>Continue</button>
            </div>
          </>
        )}

        {step === "theme" && (
          <>
            <h2>Choose a story theme</h2>
            <div className="theme-grid">
              {THEMES.map((theme) => (
                <button key={theme} className={`theme-card ${formData.theme === theme ? "selected" : ""}`} onClick={() => setFormData({ ...formData, theme: theme as Theme })}>
                  {theme}
                </button>
              ))}
            </div>
            <div className="actions">
              <button className="secondary-btn" onClick={() => setStep("details")}>Back</button>
              <button className="primary-btn" onClick={() => setStep("review")}>Continue</button>
            </div>
          </>
        )}

        {step === "review" && (
          <>
            <h2>Review before printing</h2>
            <p><strong>Name:</strong> {formData.childName}</p>
            <p><strong>Age:</strong> {formData.age}</p>
            <p><strong>Favorite animal:</strong> {formData.favoriteAnimal}</p>
            <p><strong>Favorite color:</strong> {formData.favoriteColor}</p>
            <p><strong>Theme:</strong> {formData.theme}</p>
            <p><strong>Dedication:</strong> {formData.dedication}</p>
            {error && <p style={{ color: "#b42318" }}>{error}</p>}
            <div className="actions">
              <button className="secondary-btn" onClick={() => setStep("theme")}>Back</button>
              <button className="primary-btn" onClick={generateStory}>Create My Book</button>
            </div>
          </>
        )}

        {step === "loading" && (
          <>
            <h2>Crafting your Little Gem magic...</h2>
            <p style={{ color: "#6a6a82" }}>Our story engine is personalizing each page and preparing your print layout.</p>
            <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: "#f2f3ff" }}>
              ✨ Generating title, story pages, and lesson<br />
              ✨ Formatting 12-page printable booklet
            </div>
          </>
        )}

        {step === "finished" && story && (
          <>
            <h2>Your book is ready!</h2>
            <p style={{ color: "#6a6a82" }}>Story source: <strong>{source}</strong> mode</p>
            <p><strong>Title:</strong> {story.title}</p>
            <p style={{ marginTop: 20 }}><strong>Operator:</strong> Download and print the file now.</p>
            <div className="actions">
              <button className="primary-btn" onClick={downloadPrintFile} disabled={isDownloading}>
                {isDownloading ? "Preparing PDF..." : "Download Print File"}
              </button>
              <button
                className="secondary-btn"
                onClick={() => {
                  setFormData(initialData);
                  setStory(null);
                  setSource(null);
                  setStep("welcome");
                }}
              >
                Start New Book
              </button>
            </div>
            <div style={{ marginTop: 24, padding: 20, borderRadius: 16, background: "#fafafe", border: "1px solid #e6e7f6" }}>
              <p><strong>Continue your child's adventures at LittleGemBooks.com</strong></p>
              <QRCodeSVG value="https://littlegembooks.com" size={136} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}