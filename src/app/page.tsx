"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Basic client-side redirect based on generic auth state
    const user = typeof window !== "undefined" ? localStorage.getItem("user_uuid") : null;
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-600">Loading...</div>;
}
