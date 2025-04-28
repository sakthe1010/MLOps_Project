"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";

// Dummy Question Generator (later replace with backend call)
const generateQuestions = (chapters) => {
  const questions = [];
  chapters.forEach((chapter, index) => {
    questions.push({
      id: `${index}-1`,
      chapter,
      question: `What is a key concept from "${chapter}"?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      answer: "Option A",
    });
  });
  return questions.slice(0, 10);
};

export default function TestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    const chapters = JSON.parse(localStorage.getItem("selectedChapters") || "[]");
    if (chapters.length === 0) {
      router.push("/chapter");
    } else {
      setQuestions(generateQuestions(chapters));
    }
  }, [router]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelect = (qid, option) => {
    setResponses({ ...responses, [qid]: option });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    localStorage.setItem("responses", JSON.stringify(responses));
    localStorage.setItem("questions", JSON.stringify(questions));
    router.push("/report");
  };

  if (!currentQuestion) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-purple-300 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <div className="mb-4 text-center text-gray-800">
            Question {currentQuestionIndex + 1} / {questions.length}
          </div>

          <p className="text-lg font-semibold text-black mb-4">
            {currentQuestion.question}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleSelect(currentQuestion.id, option)}
                className={`py-2 px-4 border rounded text-black ${
                  responses[currentQuestion.id] === option
                    ? "bg-blue-500 text-white"
                    : "bg-white border-gray-300"
                } transition hover:shadow-md`}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            onClick={handleNextQuestion}
            className="bg-green-600 text-white py-3 rounded w-full hover:bg-green-700"
          >
            {currentQuestionIndex === questions.length - 1 ? "Submit Test" : "Next"}
          </button>
        </div>
      </div>
    </>
  );
}
