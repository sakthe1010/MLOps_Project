"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";

export default function ReviewWrongPage() {
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : null;

  useEffect(() => {
    if (!username) {
      alert("⚠️ Please login first.");
      router.push("/login");
      return;
    }

    fetch(`http://10.42.0.1:8000/api/user/wrong-questions?username=${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch wrong questions");
        return res.json();
      })
      .then((data) => setWrongQuestions(data))
      .catch((err) => {
        console.error(err);
        alert("Failed to load review questions.");
      })
      .finally(() => setLoading(false));
  }, [username, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-black">
        Loading wrong questions...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-pink-200 p-6">
        <div className="max-w-4xl mx-auto bg-white text-black p-6 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold mb-4">❌ Review Wrong Answers</h1>

          {wrongQuestions.length === 0 ? (
            <p className="text-gray-700 text-lg">🎉 You haven’t gotten anything wrong yet!</p>
          ) : (
            <ul className="space-y-4">
              {wrongQuestions.map((q, index) => (
                <li
                  key={index}
                  className="border bg-gray-100 rounded-lg p-4"
                >
                  <p className="font-medium mb-2">{q.question}</p>
                  <p className="text-red-600">Your Answer: {q.selected}</p>
                  <p className="text-green-600">Correct Answer: {q.correct}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
