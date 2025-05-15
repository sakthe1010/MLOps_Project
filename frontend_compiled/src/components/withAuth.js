"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("⚠️ Please login to continue.");
        router.replace("/login");
      } else {
        setLoading(false);
      }
    }, [router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-black">
          Checking login...
        </div>
      );
    }

    return <Component {...props} />;
  };
}
