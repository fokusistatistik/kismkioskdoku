"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, RefreshCw, X, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [tc, setTc] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState("");

    // UI States
    const [showBindingConfirm, setShowBindingConfirm] = useState(false);
    const [showResetPanel, setShowResetPanel] = useState(false);
    const [resetPin, setResetPin] = useState("");

    // Admin PIN for resetting device
    const ADMIN_PIN = "0000";

    const handlePreLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!/^\d{11}$/.test(tc)) return setError("Geçersiz TC Kimlik Numarası (11 hane olmalı)");
        if (fullName.trim().length < 3) return setError("Lütfen geçerli bir Ad Soyad giriniz");

        // Check Binding Status
        if (typeof window !== "undefined") {
            const boundTc = localStorage.getItem("device_owner_tc");

            // If already bound and mismatch -> Error
            if (boundTc && boundTc !== tc) {
                setError("Bu cihaz başka bir TC kimlik numarasına kilitlenmiştir.");
                return;
            }

            // If NOT bound -> Ask Confirmation
            if (!boundTc) {
                setShowBindingConfirm(true);
            } else {
                // If bound and match -> Login directly
                performLogin();
            }
        }
    };

    const performLogin = () => {
        setLoading(true);
        // Bind Device (Idempotent)
        localStorage.setItem("device_owner_tc", tc);

        // Set Session
        localStorage.setItem("user_uuid", "mock-uuid-" + Math.random().toString(36).substr(2, 9));
        localStorage.setItem("user_id", tc);
        localStorage.setItem("user_name", fullName);
        localStorage.setItem("user_title", "Personel");

        setTimeout(() => router.push("/dashboard"), 1000);
    };

    const handleDeviceReset = () => {
        if (resetPin === ADMIN_PIN) {
            localStorage.removeItem("device_owner_tc");
            localStorage.removeItem("user_uuid");
            localStorage.removeItem("user_id");
            localStorage.removeItem("user_name");
            localStorage.removeItem("user_title");

            setResetPin("");
            setShowResetPanel(false);
            setError("");
            alert("Cihaz başarıyla sıfırlandı. Yeni kurulum yapabilirsiniz.");
        } else {
            alert("Hatalı Yönetici Şifresi!");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 relative">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8"
            >
                {/* Logo & Header */}
                <div className="flex flex-col items-center">
                    <div className="relative w-28 h-28 mb-4">
                        <Image src="/logo.png" alt="DOKU" fill className="object-contain drop-shadow-2xl" priority />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">DOKU</h1>
                    <p className="text-neutral-400 font-medium">Cihaz Kaydı & Giriş</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handlePreLogin} className="glass-card space-y-6 relative">
                    {/* Warning Box */}
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 items-start">
                        <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-200 leading-relaxed">
                            <strong>Dikkat:</strong> İlk girişte cihaz bu TC Kimlik numarasına kilitlenecektir.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Ad Soyad</label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full mt-2 bg-neutral-900/50 border border-neutral-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 transition-all font-medium placeholder-neutral-600 outline-none"
                                placeholder="Örn: Ahmet Yılmaz"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">TC Kimlik No</label>
                            <input
                                type="text"
                                required
                                maxLength={11}
                                value={tc}
                                onChange={(e) => setTc(e.target.value.replace(/\D/g, ''))}
                                className="w-full mt-2 bg-neutral-900/50 border border-neutral-700/50 rounded-xl px-4 py-3 text-white font-mono text-lg tracking-widest text-center focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-neutral-600 outline-none"
                                placeholder="___________"
                            />
                        </div>
                    </div>

                    {/* Error Box with Reset Option */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center space-y-3">
                            <p className="text-red-400 text-xs font-medium">{error}</p>
                            <button
                                type="button"
                                onClick={() => setShowResetPanel(true)}
                                className="text-[10px] text-red-300 underline opacity-70 hover:opacity-100"
                            >
                                Yanlış Kurulum mu? Cihazı Sıfırla
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2",
                            loading && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Giriş Yap"}
                    </button>
                </form>
            </motion.div>

            {/* CONFIRMATION MODAL (First Time) */}
            <AnimatePresence>
                {showBindingConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-6"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Emin misiniz?</h3>
                                <p className="text-neutral-400 text-sm mt-2 leading-relaxed">
                                    Cihaz <strong>{tc}</strong> numaralı kimliğe kilitlenecektir. Daha sonra bu cihazdan başka bir kişi giriş yapamaz.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowBindingConfirm(false)}
                                    className="flex-1 py-3 bg-neutral-800 text-neutral-400 font-bold rounded-xl active:scale-95 transition-all"
                                >
                                    Hayır, Düzenle
                                </button>
                                <button
                                    onClick={performLogin}
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg"
                                >
                                    Evet, Onayla
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* RESET PANEL (Admin) */}
            <AnimatePresence>
                {showResetPanel && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="bg-red-950/50 border border-red-900/50 p-6 rounded-2xl max-w-sm w-full backdrop-blur-xl relative"
                        >
                            <button onClick={() => setShowResetPanel(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
                                <X size={20} />
                            </button>

                            <h3 className="text-lg font-bold text-red-200 mb-4 flex items-center gap-2">
                                <RefreshCw size={20} /> Cihaz Sıfırlama
                            </h3>
                            <p className="text-red-300/70 text-xs mb-4">
                                Cihaz üzerindeki tüm bağları kaldırmak için yönetici doğrulama kodunu giriniz.
                            </p>

                            <input
                                type="password"
                                placeholder="Yönetici Şifresi (0000)"
                                value={resetPin}
                                onChange={(e) => setResetPin(e.target.value)}
                                className="w-full bg-black/30 border border-red-500/30 rounded-lg p-3 text-white text-center tracking-[0.5em] font-mono mb-4 focus:border-red-500 outline-none"
                            />

                            <button
                                onClick={handleDeviceReset}
                                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg shadow-lg active:scale-95 transition-all"
                            >
                                Sıfırla ve Yeniden Başlat
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
