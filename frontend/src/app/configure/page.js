"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";

export default function ConfigurePage() {
  const router = useRouter();
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [mode, setMode] = useState("test");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const selectedGrade = localStorage.getItem("selectedGrade");
    const selectedSubject = localStorage.getItem("selectedSubject");
    const selectedChapter = localStorage.getItem("selectedChapter");
    const selectedMode = localStorage.getItem("mode") || "test";

    if (!selectedGrade || !selectedSubject || !selectedChapter) {
      router.push("/chapter");
      return;
    }

    setGrade(selectedGrade.replace("Class ", ""));
    setSubject(selectedSubject.toLowerCase());
    setChapter(selectedChapter);
    setMode(selectedMode);
  }, [router]);

  const preparePayload = () => {
    let easy = 0;
    let medium = 0;
    let hard = 0;

    if (mode === "test") {
      easy = Math.round(0.3 * questionCount);
      medium = Math.round(0.4 * questionCount);
      hard = questionCount - easy - medium;
    } else if (mode === "practice") {
      if (difficulty === "Easy") {
        easy = questionCount;
      } else if (difficulty === "Medium") {
        medium = questionCount;
      } else if (difficulty === "Hard") {
        hard = questionCount;
      } else if (difficulty === "Adaptive") {
        easy = Math.floor(questionCount / 3);
        medium = Math.floor(questionCount / 3);
        hard = questionCount - easy - medium;
      }
    }

    return {
      class_: grade,
      subject: subject,
      chapter: chapter,
      difficulty_counts: { easy, medium, hard }
    };
  };

  const handleSubmit = async () => {
    if (questionCount < 1 || questionCount > 20) {
      alert("Number of questions must be between 1 and 20.");
      return;
    }

    const payload = preparePayload();
    const token = localStorage.getItem("token"); // ✅ Get token from login

    if (!token) {
      alert("You are not logged in. Please log in again.");
      router.push("/login");
      return;
    }

    console.log("Prepared Payload:", payload);

    try {
      setIsLoading(true);

      const res = await fetch("https://nwnktpr5-8000.inc1.devtunnels.ms/api/generate-mcqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // ✅ Attach Bearer token
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to generate questions.");

      const data = await res.json();
      console.log("Received questions:", data);

      localStorage.setItem("mcqs", JSON.stringify(data.mcqs || data.questions || []));
      router.push("/test");
    } catch (error) {
      console.error(error);
      alert("Error generating questions. Please try again.");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-300 to-indigo-400 p-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-dashed border-white rounded-full animate-spin"></div>
            <h2 className="text-2xl font-bold text-white mt-6">Generating your MCQs...</h2>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-200 to-pink-400 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <h1 className="text-3xl font-bold mb-6 text-center text-black">
            {mode === "practice" ? "Configure Practice" : "Configure Test"}
          </h1>

          <div className="grid grid-cols-1 gap-4 mb-6">
            {/* Display selected grade/subject/chapter */}
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

            {/* Practice mode difficulty selector */}
            {mode === "practice" && (
              <div>
                <label className="block text-black mb-2">Select Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 border rounded text-black"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                  <option>Adaptive</option>
                </select>
              </div>
            )}

            {/* Number of questions selector */}
            <div>
              <label className="block text-black mb-2">Number of Questions (Max 20)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                className="w-full p-3 border rounded text-black"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
          >
            Generate Questions
          </button>
        </div>
      </div>
    </>
  );
}
