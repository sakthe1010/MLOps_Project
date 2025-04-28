"use client";

import Navbar from "../../components/navbar";

export default function HelpPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 to-pink-400 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <h1 className="text-2xl font-bold mb-6 text-center text-black">How to Use EduTest App</h1>
          <ul className="list-disc list-inside text-gray-800 space-y-4">
            <li>🧑‍🎓 Log in using your registered email and password.</li>
            <li>🏫 Select your Grade/Class.</li>
            <li>📚 Choose your Subject (e.g., Science, Maths).</li>
            <li>📖 Pick the Chapters you want to be tested on.</li>
            <li>🧠 Take the multiple-choice test.</li>
            <li>📈 View your performance report and chapter-wise recommendations.</li>
            <li>📋 Use Dashboard to retake tests or view help anytime.</li>
          </ul>
        </div>
      </div>
    </>
  );
}
