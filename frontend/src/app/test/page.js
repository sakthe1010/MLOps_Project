"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";

export default function TestPage() {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [mode, setMode] = useState("test");

  // Token and MCQs check
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setTimeout(() => {
        const retryToken = localStorage.getItem("token");
        if (!retryToken) {
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

  useEffect(() => {
    if (checkedAuth) {
      const stored = JSON.parse(localStorage.getItem("mcqs") || "[]");
      const selectedMode = localStorage.getItem("mode") || "test";

      if (stored.length === 0) {
        router.push("/configure");
        return;
      }

      setQuestions(stored);
      setMode(selectedMode);
    }
  }, [checkedAuth, router]);

  const handleOptionSelect = (optionKey) => {
    setSelectedOption(optionKey);
  };

  const handleCheckAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (selectedOption === currentQuestion.answer) {
      setFeedback("✅ Correct!");
      setScore((prev) => prev + 1);
    } else {
      setFeedback(`❌ Wrong! Correct Answer: ${currentQuestion.answer}`);
    }
    setIsAnswerChecked(true);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setFeedback("");
    setIsAnswerChecked(false);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  if (!checkedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-black">
        Checking login...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-black">
        Loading questions...
      </div>
    );
  }

  if (showResults) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-300 to-blue-300 p-6">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-black mb-6">Test Completed!</h2>
            <p className="text-xl text-black mb-4">
              Your Score: {score} / {questions.length}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-300 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
          <h2 className="text-xl font-bold text-black mb-4">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <p className="text-black mb-6">{currentQuestion.question}</p>

          <div className="grid grid-cols-1 gap-4 mb-4">
            {Object.entries(currentQuestion.options).map(([key, value], idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(key)}
                className={`w-full p-3 rounded-lg font-semibold ${
                  selectedOption === key
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-black hover:bg-gray-300"
                } transition-all duration-300`}
              >
                {key}. {value}
              </button>
            ))}
          </div>

          {feedback && (
            <div className="text-xl font-bold text-black text-center mb-4 animate-fade-slide">
              {feedback}
            </div>
          )}

          {!isAnswerChecked ? (
            <button
              onClick={handleCheckAnswer}
              disabled={!selectedOption}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </>
  );
}
