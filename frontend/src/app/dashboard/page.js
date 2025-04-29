"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";

export default function DashboardPage() {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      alert("⚠️ Please login first to access the Dashboard.");  // ✅ Warning before redirect
      router.replace('/login');
    } else {
      setCheckedAuth(true);
    }
  }, [router]);

  if (!checkedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-black">
        Checking login...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-300 to-indigo-400 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center transition-all">
          <h1 className="text-4xl font-extrabold text-black mb-8 animate-fade-down">
            Welcome to Your Dashboard
          </h1>
          <div className="flex flex-col gap-6">
            <button
              onClick={() => router.push("/grade")}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
            >
              📚 Start a New Test
            </button>
            <button
              onClick={() => router.push("/report")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
            >
              📈 View Previous Report
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
            >
              👤 My Profile
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
