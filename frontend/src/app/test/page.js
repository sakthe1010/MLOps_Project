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
    const mcqs = JSON.parse(localStorage.getItem("mcqs") || "[]");
    const selectedMode = localStorage.getItem("mode") || "test";

    if (mcqs.length === 0) {
      router.push("/configure");
      return;
    }

    setQuestions(mcqs);
    setMode(selectedMode);
  }, [router]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (selectedOption === currentQuestion.correct_answer) {
      setFeedback("✅ Correct!");
    } else {
      setFeedback(`❌ Wrong! Correct answer: ${currentQuestion.correct_answer}`);
    }

    if (mode === "test" && selectedOption === currentQuestion.correct_answer) {
      setScore(score + 1);
    }

    setCheckedAnswer(true);
  };

  const handleNextQuestion = () => {
    setSelectedAnswers([
      ...selectedAnswers,
      { question: questions[currentQuestionIndex].question, selected: selectedOption },
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

  const progressPercentage = (currentQuestionIndex / questions.length) * 100;

  if (questions.length === 0) return <div>Loading questions...</div>;

  return (
    <>
      <Navbar />
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mx-auto mt-4 mb-4">
        <div className="w-full bg-gray-300 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-300 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <h2 className="text-xl font-bold text-black mb-4">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <p className="text-black mb-4">{questions[currentQuestionIndex].question}</p>

          <div className="grid grid-cols-1 gap-4 mb-4">
            {questions[currentQuestionIndex].options.map((option, idx) => (
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

          {/* Feedback */}
          {mode === "practice" && feedback && (
            <div className="text-xl font-bold text-black text-center mb-4 animate-fade-slide">
              {feedback}
            </div>
          )}

          {/* Action Button */}
          {mode === "practice" ? (
            !checkedAnswer ? (
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
            )
          ) : (
            <button
              onClick={handleNextQuestion}
              disabled={!selectedOption}
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Submit & Next
            </button>
          )}
        </div>
      </div>
    </>
  );
}
