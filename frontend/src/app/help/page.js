"use client";

import Navbar from "../../components/navbar";

export default function HelpPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 to-pink-400 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl">
          <h1 className="text-3xl font-bold text-center text-black mb-8 animate-fade-down">
            📚 How to Use EduTest
          </h1>

          <ul className="list-disc list-inside space-y-4 text-lg text-gray-800">
            <li>🧑‍🎓 <strong>Login</strong> using your registered email and password.</li>
            <li>🏫 <strong>Select your Grade/Class.</strong></li>
            <li>📚 <strong>Choose your Subject</strong> (e.g., Science, Maths).</li>
            <li>📖 <strong>Pick the Chapters</strong> you want to practice or be tested on.</li>
            <li>🧠 <strong>Take the multiple-choice test</strong> or practice session.</li>
            <li>📈 <strong>View your performance report</strong> after finishing the test.</li>
            <li>🏠 <strong>Use Dashboard</strong> to retake tests or review reports anytime.</li>
          </ul>

          <div className="text-center mt-10">
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
