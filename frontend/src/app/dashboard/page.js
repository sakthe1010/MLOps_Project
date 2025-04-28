"use client";

import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-300 to-indigo-400 p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-black mb-6">Dashboard</h1>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => router.push("/grade")}
              className="bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-300"
            >
              📚 Start a New Test
            </button>
            <button
              onClick={() => router.push("/report")}
              className="bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition duration-300"
            >
              📈 View Previous Report
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition duration-300"
            >
              👤 My Profile
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
