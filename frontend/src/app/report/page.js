"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReportPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [score, setScore] = useState(0);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const storedQuestions = JSON.parse(localStorage.getItem("questions") || "[]");
    const storedResponses = JSON.parse(localStorage.getItem("responses") || "{}");

    if (!storedQuestions.length) {
      router.push("/test");
      return;
    }

    setQuestions(storedQuestions);
    setResponses(storedResponses);

    // Evaluate
    let correct = 0;
    const weakChapters = new Set();

    storedQuestions.forEach((q) => {
      if (storedResponses[q.id] === q.answer) {
        correct++;
      } else {
        weakChapters.add(q.chapter);
      }
    });

    setScore(correct);

    // Recommendation: Chapters where mistakes occurred
    setRecommendations(Array.from(weakChapters));
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 to-blue-200 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center text-black mb-4">Your Test Report</h1>
        <p className="text-lg text-center text-gray-800 mb-6">Score: {score} / {questions.length}</p>

        {questions.map((q, index) => {
          const userAnswer = responses[q.id];
          const isCorrect = userAnswer === q.answer;

          return (
            <div key={q.id} className="mb-4">
              <p className="font-semibold text-black mb-1">
                {index + 1}. {q.question}
              </p>
              <p className={`mb-1 ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                Your answer: {userAnswer || "Not answered"}
              </p>
              {!isCorrect && (
                <p className="text-blue-600">
                  Correct answer: {q.answer}
                </p>
              )}
            </div>
          );
        })}

        {recommendations.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 rounded">
            <h2 className="text-lg font-semibold text-black mb-2">📌 Recommended Chapters to Revise:</h2>
            <ul className="list-disc list-inside text-gray-800">
              {recommendations.map((chapter, i) => (
                <li key={i}>{chapter}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
