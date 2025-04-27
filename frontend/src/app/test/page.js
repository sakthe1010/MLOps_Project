"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Dummy question generator
const generateQuestions = (chapters) => {
  const questions = [];
  chapters.forEach((chapter, index) => {
    for (let i = 1; i <= 2; i++) {
      questions.push({
        id: `${index}-${i}`,
        chapter,
        question: `Q${i}: What is a key concept from "${chapter}"?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        answer: "Option A", // For now, all correct answers are "Option A"
      });
    }
  });
  return questions.slice(0, 10); // Limit to 10 questions
};

export default function TestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    const chapters = JSON.parse(localStorage.getItem("selectedChapters") || "[]");
    if (chapters.length === 0) {
      router.push("/chapter");
    } else {
      setQuestions(generateQuestions(chapters));
    }
  }, [router]);

  const handleSelect = (qid, option) => {
    setResponses({ ...responses, [qid]: option });
  };

  const handleSubmit = () => {
    localStorage.setItem("responses", JSON.stringify(responses));
    localStorage.setItem("questions", JSON.stringify(questions));
    router.push("/report");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-300 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Your Test</h1>
        {questions.map((q, index) => (
          <div key={q.id} className="mb-6">
            <p className="font-semibold text-black mb-2">
              {index + 1}. {q.question}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(q.id, option)}
                  className={`py-2 px-4 border rounded text-black text-left ${
                    responses[q.id] === option
                      ? "bg-blue-500 text-white"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );
}
