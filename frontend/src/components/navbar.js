"use client";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="bg-blue-500 p-4 flex justify-between items-center text-white">
      <h1
        className="font-bold text-lg cursor-pointer"
        onClick={() => router.push("/dashboard")}
      >
        EduTest App
      </h1>
      <div className="space-x-4">
        <button onClick={() => router.push("/dashboard")} className="hover:underline">
          Dashboard
        </button>
        <button onClick={() => router.push("/help")} className="hover:underline">
          Help
        </button>
        <button onClick={() => router.push("/login")} className="hover:underline">
          Logout
        </button>
      </div>
    </nav>
  );
}
