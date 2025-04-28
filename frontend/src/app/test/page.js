"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";
import confetti from "canvas-confetti";

export default function TestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [mode, setMode] = useState("test");
  const [feedback, setFeedback] = useState("");
  const [checkedAnswer, setCheckedAnswer] = useState(false);

  useEffect(() => {
    const selectedChapters = JSON.parse(localStorage.getItem("selectedChapters") || "[]");
    const selectedMode = localStorage.getItem("mode") || "test";

    if (selectedChapters.length === 0) {
      router.push("/chapter");
      return;
    }

    setMode(selectedMode);

    // Mock questions
    const mockQuestions = [
      {
        question: "What is the capital of France?",
        options: ["Paris", "Berlin", "Rome", "Madrid"],
        correctAnswer: "Paris",
      },
      {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: "4",
      },
    ];

    setQuestions(mockQuestions);
  }, [router]);

  useEffect(() => {
    if (showResults && mode === "test") {
      const totalQuestions = questions.length;
      const correctAnswers = selectedAnswers.filter(
        (ans, idx) => ans.selected === questions[idx].correctAnswer
      ).length;
      if (correctAnswers === totalQuestions) {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      }
    }
  }, [showResults, mode, selectedAnswers, questions]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    const currentQuestion = questions[currentQuestionIndex];

    if (selectedOption === currentQuestion.correctAnswer) {
      setFeedback("✅ Correct!");
    } else {
      setFeedback(`❌ Wrong! Correct answer: ${currentQuestion.correctAnswer}`);
    }

    if (mode === "test") {
      if (selectedOption === currentQuestion.correctAnswer) {
        setScore(score + 1);
      }
    }

    setCheckedAnswer(true);
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];

    setSelectedAnswers([
      ...selectedAnswers,
      { question: currentQuestion.question, selected: selectedOption },
    ]);

    setSelectedOption(null);
    setFeedback("");
    setCheckedAnswer(false);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleReturnToDashboard = () => {
    // Save final report before going back
    const totalQuestions = questions.length;
    const correctAnswers = selectedAnswers.filter(
      (ans, idx) => ans.selected === questions[idx].correctAnswer
    ).length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const accuracy = ((correctAnswers / totalQuestions) * 100).toFixed(2);

    const lastReport = {
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      accuracy,
      mode,
      date: new Date().toLocaleString(),
    };

    localStorage.setItem("lastReport", JSON.stringify(lastReport));

    // Clear session
    localStorage.removeItem("selectedChapters");
    localStorage.removeItem("mode");
    localStorage.removeItem("selectedGrade");
    localStorage.removeItem("selectedSubject");

    router.push("/dashboard");
  };

  if (questions.length === 0) {
    return <div>Loading questions...</div>;
  }

  if (showResults) {
    const totalQuestions = questions.length;
    const correctAnswers = selectedAnswers.filter(
      (ans, idx) => ans.selected === questions[idx].correctAnswer
    ).length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const accuracy = ((correctAnswers / totalQuestions) * 100).toFixed(2);

    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-300 to-blue-400 p-6">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl text-center">
            <h1 className="text-3xl font-bold mb-6 text-black">
              {mode === "test" ? "Test Report" : "Practice Report"}
            </h1>

            <>
              <p className="text-lg text-black mb-2">Total Questions: {totalQuestions}</p>
              <p className="text-lg text-black mb-2">Correct Answers: {correctAnswers}</p>
              <p className="text-lg text-black mb-2">Wrong Answers: {wrongAnswers}</p>
              <p className="text-lg text-black mb-2">Accuracy: {accuracy}%</p>
            </>

            <p className="text-lg text-black mt-4 mb-8">Thanks for completing the {mode}!</p>

            <button
              onClick={handleReturnToDashboard}
              className="bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-indigo-400 p-6">
        {/* Progress Bar */}
        <div className="w-full max-w-2xl mb-6">
          <div className="w-full bg-gray-300 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <h1 className="text-2xl font-bold mb-6 text-center text-black">
            {mode === "test" ? "Test Mode" : "Practice Mode"}
          </h1>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-black">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h2>
            <p className="text-black mb-4">{currentQuestion.question}</p>
            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full p-3 rounded ${
                    selectedOption === option ? "bg-blue-500 text-white" : "bg-gray-100 text-black"
                  } hover:bg-gray-300 transition`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {mode === "practice" && feedback && (
            <div className="text-xl font-bold text-black text-center mb-4 animate-fade-slide">
              {feedback}
            </div>
          )}

          {/* Buttons */}
          {mode === "practice" ? (
            <div className="flex flex-col items-center">
              {!checkedAnswer ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={!selectedOption}
                  className="bg-purple-600 text-white py-3 px-6 rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="bg-green-600 text-white py-3 px-6 rounded hover:bg-green-700"
                >
                  Next Question
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleNextQuestion}
              disabled={!selectedOption}
              className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              Submit & Next
            </button>
          )}
        </div>
      </div>
    </>
  );
}
