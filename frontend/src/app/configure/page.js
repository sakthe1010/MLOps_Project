"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";
import withAuth from "../../components/withAuth";

export default function ConfigurePage() {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [mode, setMode] = useState("test");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setTimeout(() => {
        const retryToken = localStorage.getItem("token");
        if (!retryToken) {
          alert("⚠️ Please login first to configure the test.");
          router.replace("/login");
        } else {
          setCheckedAuth(true);
        }
      }, 300);
    } else {
      setCheckedAuth(true);
    }
  }, [router]);

  useEffect(() => {
    if (checkedAuth) {
      const selectedGrade = localStorage.getItem("selectedGrade");
      const selectedSubject = localStorage.getItem("selectedSubject");
      const selectedChapter = localStorage.getItem("selectedChapter");
      const selectedMode = localStorage.getItem("mode") || "test";

      if (!selectedGrade || !selectedSubject || !selectedChapter) {
        router.replace("/chapter");
        return;
      }

      setGrade(selectedGrade.replace("Class ", ""));
      setSubject(selectedSubject.toLowerCase());
      setChapter(selectedChapter);
      setMode(selectedMode);
    }
  }, [checkedAuth, router]);

  const preparePayload = () => {
    let easy = 0, medium = 0, hard = 0;

    if (mode === "test") {
      easy = Math.round(0.3 * questionCount);
      medium = Math.round(0.4 * questionCount);
      hard = questionCount - easy - medium;
    } else if (mode === "practice") {
      if (difficulty === "Easy") easy = questionCount;
      else if (difficulty === "Medium") medium = questionCount;
      else if (difficulty === "Hard") hard = questionCount;
      else if (difficulty === "Adaptive") {
        const total = Math.min(Math.ceil(questionCount * 1.5), 30);
        const ratioSum = 7 + 5 + 3;
        easy = Math.round((7 / ratioSum) * total);
        medium = Math.round((5 / ratioSum) * total);
        hard = total - easy - medium;
      }
    }

    return {
      class_: grade,
      subject: subject,
      chapter: chapter,
      difficulty_counts: { easy, medium, hard },
      mode: mode,
      difficulty: difficulty // ✅ Include this explicitly for test page to read
    };
  };

  const handleSubmit = async () => {
    if (questionCount < 1 || questionCount > 20) {
      alert("⚠️ Number of questions must be between 1 and 20.");
      return;
    }

    const payload = preparePayload();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("⚠️ Please login again.");
      router.replace("/login");
      return;
    }

    localStorage.setItem("generationContext", JSON.stringify(payload));

    // ✅ Store adaptiveCount only if adaptive selected
    if (payload.mode === "practice" && payload.difficulty === "Adaptive") {
      localStorage.setItem("adaptiveCount", questionCount);
    }

    console.log("📦 Generation Context Saved:", payload);

    try {
      setIsLoading(true);
      setError("");

      const res = await fetchWithTimeout(
        "http://10.42.0.1:8000/api/generate-mcqs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
        30000
      );

      if (!res.ok) throw new Error("Failed to generate questions.");

      const data = await res.json();
      localStorage.setItem("mcqs", JSON.stringify(data.mcqs || data.questions || []));
      router.push("/test");
    } catch (err) {
      console.error(err);
      setError("❌ Error generating questions. Please try again.");
      setIsLoading(false);
    }
  };

  if (!checkedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-black">
        Checking login...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-300 to-indigo-400 p-6">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full border-white animate-spin"></div>
          <p className="text-xl font-semibold text-white mt-6">
            Generating your MCQs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-200 to-pink-400 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-center text-black mb-8 animate-fade-down">
            {mode === "practice" ? "Configure Practice" : "Configure Test"}
          </h1>

          {error && (
            <div className="mb-4 text-center text-red-600 font-semibold">
              {error}
              <br />
              <button
                onClick={handleSubmit}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Retry
              </button>
            </div>
          )}

          {!error && (
            <>
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div>
                  <label className="block text-black mb-2">Selected Class</label>
                  <input type="text" value={grade} disabled className="w-full p-3 border rounded bg-gray-100 text-black" />
                </div>
                <div>
                  <label className="block text-black mb-2">Selected Subject</label>
                  <input type="text" value={subject} disabled className="w-full p-3 border rounded bg-gray-100 text-black" />
                </div>
                <div>
                  <label className="block text-black mb-2">Selected Chapter</label>
                  <input type="text" value={chapter} disabled className="w-full p-3 border rounded bg-gray-100 text-black" />
                </div>

                {mode === "practice" && (
                  <div>
                    <label className="block text-black mb-2">Select Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full p-3 border rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    >
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                      <option>Adaptive</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-black mb-2">Number of Questions (Max 20)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full p-3 border rounded text-black"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
              >
                Generate Questions
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
