"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";

export default function TestPage() {
  const router = useRouter();

  /* --------------------------- STATE --------------------------- */
  const [checkedAuth, setCheckedAuth] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [currentDifficulty, setCurrentDifficulty] = useState("medium");
  const [difficultyMode, setDifficultyMode] = useState("Medium");
  const [mode, setMode] = useState("test");

  const [questionCount, setQuestionCount] = useState(10);

  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [feedback, setFeedback] = useState("");

  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const [answeredQs, setAnsweredQs] = useState([]);
  const [wrong_questions, setWrongQuestions] = useState([]);
  const [context_json, setContextJson] = useState(null);

  /* Adaptive pools */
  const [easyQs, setEasyQs] = useState([]);
  const [mediumQs, setMediumQs] = useState([]);
  const [hardQs, setHardQs] = useState([]);

  /* --------------------------- EFFECTS --------------------------- */

  // 1️⃣  Ensure user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setTimeout(() => {
        if (!localStorage.getItem("token")) {
          alert("⚠️ Please login first to take the test.");
          router.replace("/login");
        } else {
          setCheckedAuth(true);
        }
      }, 300);
    } else {
      setCheckedAuth(true);
    }
  }, [router]);

  // 2️⃣  Load questions + generation context after auth ✅
  useEffect(() => {
    if (!checkedAuth) return;

    const all = JSON.parse(localStorage.getItem("mcqs") || "[]");
    const genCtx = JSON.parse(localStorage.getItem("generationContext") || "{}");
    const modeStored = localStorage.getItem("mode") || "test";

    setMode(modeStored);
    setDifficultyMode(genCtx.difficulty || "Medium");
    setContextJson(genCtx);

    const totalQs =
      genCtx.difficulty === "Adaptive"
        ? Number(localStorage.getItem("adaptiveCount") || 10)
        : all.length;
    setQuestionCount(totalQs);

    if (modeStored === "practice" && genCtx.difficulty === "Adaptive") {
      const easy = all.filter((q) => q.difficulty === "easy");
      const med = all.filter((q) => q.difficulty === "medium");
      const hard = all.filter((q) => q.difficulty === "hard");

      setEasyQs(easy);
      setMediumQs(med.slice(1)); // keep first medium for start
      setHardQs(hard);

      setCurrentDifficulty("medium");
      setCurrentQuestion(med[0]);
    } else {
      setQuestions(all);
      setCurrentQuestion(all[0]);
    }

    setCurrentIndex(0);
  }, [checkedAuth]);

  /* --------------------------- HELPERS --------------------------- */

  const handleOptionSelect = (key) => setSelectedOption(key);

  const handleCheckAnswer = () => {
    const correct = selectedOption === currentQuestion.answer;

    if (correct) {
      setScore((s) => s + 1);
      setFeedback("✅ Correct!");
    } else {
      setFeedback(`❌ Wrong! Correct: ${currentQuestion.answer}`);
      setWrongQuestions((w) => [
        ...w,
        {
          question: currentQuestion.question,
          selected: selectedOption,
          correct: currentQuestion.answer,
        },
      ]);
    }

    setAnsweredQs((a) => [...a, currentQuestion]);
    setIsAnswerChecked(true);
  };

  // Adaptive next‑question selector with graceful fallback
  const getNextAdaptiveQuestion = (wasCorrect) => {
    if (currentDifficulty === "easy") {
      return wasCorrect
        ? mediumQs.shift() ?? hardQs.shift() ?? easyQs.shift()
        : easyQs.shift() ?? mediumQs.shift() ?? hardQs.shift();
    }
    if (currentDifficulty === "medium") {
      return wasCorrect
        ? hardQs.shift() ?? mediumQs.shift() ?? easyQs.shift()
        : easyQs.shift() ?? mediumQs.shift() ?? hardQs.shift();
    }
    if (currentDifficulty === "hard") {
      return wasCorrect
        ? hardQs.shift() ?? mediumQs.shift() ?? easyQs.shift()
        : mediumQs.shift() ?? easyQs.shift();
    }
    return null;
  };

  // Send report ➡️ show results immediately (no UI lag)
  const submitReportAndFinish = async () => {
    setShowResults(true); // 🔑 show results right away

    const report = {
      username: localStorage.getItem("username") ?? "anonymous",
      mode,
      score,
      total: questionCount,
      date: new Date().toISOString(),
      context_json,
      wrong_questions,
    };

    try {
      await fetch("http://localhost:8000/api/user/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
    } catch (err) {
      console.error("Report failed", err);
    }
  };

  /* --------------------------- NAVIGATION --------------------------- */

  const handleNextQuestion = () => {
    const isAdaptive = mode === "practice" && difficultyMode === "Adaptive";

    // ✅  If that was the LAST question, finish immediately (no flicker)
    if (currentIndex + 1 >= questionCount) {
      submitReportAndFinish();
      return;
    }

    // Determine the next question **before** clearing UI state
    let nextQ;
    const wasCorrect = selectedOption === currentQuestion.answer;

    if (isAdaptive) {
      nextQ = getNextAdaptiveQuestion(wasCorrect);
      if (!nextQ) {
        submitReportAndFinish();
        return;
      }
      setCurrentDifficulty(nextQ.difficulty);
    } else {
      nextQ = questions[currentIndex + 1];
    }

    // Clear UI state and move on
    setSelectedOption(null);
    setFeedback("");
    setIsAnswerChecked(false);

    setCurrentQuestion(nextQ);
    setCurrentIndex((i) => i + 1);
  };

  /* --------------------------- RENDER --------------------------- */

  // 1️⃣  Results screen
  if (showResults) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-300 to-blue-300 p-6">
          <div className="bg-white text-black p-8 rounded-lg shadow-md w-full max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-6">🎉 Test Completed!</h2>
            <p className="text-xl mb-4">
              Your Score: {score} / {questionCount}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  // 2️⃣  Loading …
  if (!checkedAuth || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl text-black">
        Loading…
      </div>
    );
  }

  // 3️⃣  Test UI
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-300 p-6">
        <div className="bg-white text-black p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4">
            Question {currentIndex + 1} of {questionCount}
          </h2>

          <p className="mb-6">{currentQuestion.question}</p>

          <div className="space-y-4 mb-6">
            {Object.entries(currentQuestion.options).map(([k, v]) => (
              <button
                key={k}
                onClick={() => handleOptionSelect(k)}
                className={`w-full p-3 rounded-lg font-semibold transition ${
                  selectedOption === k
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-black"
                }`}
              >
                {k}. {v}
              </button>
            ))}
          </div>

          {feedback && <div className="mb-4 font-bold text-black">{feedback}</div>}

          {!isAnswerChecked ? (
            <button
              onClick={handleCheckAnswer}
              disabled={!selectedOption}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </>
  );
}
