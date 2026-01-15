"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [tc, setTc] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Basic TC Validation (11 digits)
        if (!/^\d{11}$/.test(tc)) {
            setError("Geçersiz TC Kimlik Numarası");
            setLoading(false);
            return;
        }

        setTimeout(() => {
            if (typeof window !== "undefined") {
                // Check if device is already bound to another TC
                const boundTc = localStorage.getItem("device_owner_tc");

                if (boundTc && boundTc !== tc) {
                    setError("Bu cihaz başka bir kullanıcı adına kayıtlıdır. Lütfen sistem yöneticisi ile iletişime geçin.");
                    setLoading(false);
                    return;
                }

                // Bind Device
                if (!boundTc) {
                    localStorage.setItem("device_owner_tc", tc);
                }

                // Set Session
                localStorage.setItem("user_uuid", "mock-uuid-" + Math.random().toString(36).substr(2, 9));
                localStorage.setItem("user_name", "Kullanıcı " + tc.substring(0, 3)); // Mock Name
                localStorage.setItem("user_title", "Personel");

                router.push("/dashboard");
            }
        }, 1500);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md space-y-8"
            >
                <div className="flex flex-col items-center">
                    <div className="relative w-28 h-28 mb-4">
                        <Image
                            src="/logo.png"
                            alt="DOKU Logosu"
                            fill
                            className="object-contain drop-shadow-2xl"
                            priority
                        />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">DOKU</h1>
                    <p className="text-neutral-400 font-medium">Cihaz Kaydı & Giriş</p>
                </div>

                <form onSubmit={handleLogin} className="glass-card space-y-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                        <p className="text-xs text-blue-200 leading-relaxed text-center">
                            Uyarı: Bu cihaz girdiğiniz TC Kimlik Numarasına sabitlenecektir. Çıkış yapılamaz.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">TC Kimlik No</label>
                            <input
                                type="text"
                                required
                                maxLength={11}
                                className="w-full mt-2 bg-neutral-900/50 border border-neutral-700/50 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-lg tracking-widest text-center"
                                placeholder="___________"
                                value={tc}
                                onChange={(e) => setTc(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center",
                            loading && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Kaydet ve Gir"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
