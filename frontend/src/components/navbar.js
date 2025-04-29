"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    router.replace('/login');
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1
        className="text-xl font-bold text-black cursor-pointer"
        onClick={() => router.push('/dashboard')}
      >
        EduTest
      </h1>
      <div className="flex items-center gap-6">
        <button
          onClick={() => router.push('/help')}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Help
        </button>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800 underline"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
