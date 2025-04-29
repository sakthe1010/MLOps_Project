"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminStatus = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(adminStatus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userName");

    // Redirect based on role
    if (isAdmin) {
      router.replace("/admin/login");
    } else {
      router.replace("/login");
    }
  };

  return (
    <nav className="bg-gradient-to-r from-violet-500 to-indigo-500 shadow-md p-4 flex justify-between items-center">
      <h1
        className="text-xl font-bold text-white cursor-pointer"
        onClick={() =>
          router.push(isAdmin ? "/admin/dashboard" : "/dashboard")
        }
      >
        EduTest
      </h1>
      <div className="flex items-center gap-6">
        {!isAdmin && (
          <button
            onClick={() => router.push("/help")}
            className="text-sm text-white hover:text-gray-200 underline"
          >
            Help
          </button>
        )}
        <button
          onClick={handleLogout}
          className="text-sm text-red-100 hover:text-red-300 underline"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
