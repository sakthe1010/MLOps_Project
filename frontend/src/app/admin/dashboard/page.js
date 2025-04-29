"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/navbar";

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(null); // null = still checking
  const [chapterData, setChapterData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin === "true") {
      setAuthorized(true);
    } else {
      setAuthorized(false);
    }
  }, []);

  useEffect(() => {
    if (authorized === false) {
      alert("⚠️ Unauthorized access! Please login first.");
      router.replace("/admin/login");
    } else if (authorized === true) {
      fetchChapters();
    }
  }, [authorized, router]);

  const fetchChapters = async () => {
    try {
      const res = await fetch("/api/admin/chapters");
      const data = await res.json();
      setChapterData(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch chapters", error);
      setLoading(false);
    }
  };

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-black">
        Checking Admin Access...
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-black">
        Redirecting to Login...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-black">
        Loading Admin Data...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-200 to-gray-400 p-6">
        {/* Your Admin dashboard content */}
      </div>
    </>
  );
}
