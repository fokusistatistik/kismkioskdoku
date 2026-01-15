"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface JWTPayload {
    kid: string;
    nam: string; // Kiosk Name
    loc: string;
    iat: number;
}

export default function ScanPage() {
    const router = useRouter();
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [mounted, setMounted] = useState(false);
    const [scannedData, setScannedData] = useState<{ raw: string; payload: JWTPayload } | null>(null);
    const [status, setStatus] = useState<"idle" | "confirm" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const startScanner = useCallback(() => {
        // Prevent starting if already active or confirmation/loading
        if (status !== "idle" || !mounted) return;

        // Cleanup if exists
        if (scannerRef.current?.isScanning) {
            scannerRef.current.stop().catch(console.error);
        }

        const scannerId = "reader";
        // Ensure element exists
        if (!document.getElementById(scannerId)) return;

        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;

        scanner.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
            },
            (decodedText) => {
                handleScan(decodedText);
            },
            (errorMessage) => {
                // ignore
            }
        ).catch(err => {
            console.error("Camera error", err);
            setErrorMessage("Please enable camera permissions.");
            setStatus("error");
        });
    }, [status, mounted]);

    const stopScanner = () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => { });
            scannerRef.current.clear();
        }
    };

    useEffect(() => {
        setMounted(true);
        if (!localStorage.getItem("user_uuid")) {
            router.push("/login");
        }
        return () => {
            stopScanner();
        };
    }, [router]);

    useEffect(() => {
        if (mounted && status === "idle") {
            // Small delay to ensure DOM is ready
            const t = setTimeout(startScanner, 100);
            return () => clearTimeout(t);
        }
    }, [mounted, status, startScanner]);

    const handleScan = (rawJwt: string) => {
        try {
            stopScanner(); // Pause scanning logic
            const decoded = jwtDecode<JWTPayload>(rawJwt);
            // Basic validation
            if (!decoded.nam) throw new Error("Invalid QR Code Structure");

            setScannedData({ raw: rawJwt, payload: decoded });
            setStatus("confirm");
        } catch (e) {
            console.error("Invalid JWT", e);
            // Optionally show toast 'Invalid QR', but for now assume good QR
        }
    };

    const confirmAccess = async () => {
        if (!scannedData) return;
        setStatus("loading");

        const userId = localStorage.getItem("user_uuid");

        try {
            // Mock API Call: POST [API_URL]/api/mobile/scan
            // Body: { qr_token, user_id, device_uuid }
            // Enhance Device Info if possible (User Agent/Platform)
            // Note: True Device UUID is hard in web, usually generated and stored in localStorage
            const userAgent = window.navigator.userAgent;
            const platform = (window.navigator as any).userAgentData?.platform || window.navigator.platform;

            console.log("Sending Access Request:", {
                qr_token: scannedData.raw,
                user_id: userId,
                device_info: {
                    uuid: "device-uuid-mock", // In real app, generate once and store
                    user_agent: userAgent,
                    platform: platform,
                    timestamp: new Date().toISOString()
                }
            });

            // Simulate Network Delay
            await new Promise(r => setTimeout(r, 1500));

            // Mock Success only for demo. 
            // In real app, check response.ok
            const isSuccess = true;

            if (isSuccess) {
                setStatus("success");
                setTimeout(() => router.push("/dashboard"), 2500);
            } else {
                throw new Error("Access Denied by Server");
            }
        } catch (error: any) {
            setErrorMessage(error.message || "Unknown error");
            setStatus("error");
        }
    };

    const resetScan = () => {
        setScannedData(null);
        setErrorMessage("");
        setStatus("idle"); // This triggers useEffect to restart scanner
    };

    return (
        <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-8 flex justify-between items-center bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                <button onClick={() => router.back()} className="text-white bg-white/10 p-3 rounded-full backdrop-blur-md active:bg-white/20 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <span className="text-white bg-black/50 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-white/10 backdrop-blur-md">QR TARA</span>
                <div className="w-12" />
            </div>

            {/* Camera Container */}
            <div className="flex-1 bg-black relative flex items-center justify-center">
                {mounted && <div id="reader" className="w-[100vw] h-[100vh] object-cover" />}
            </div>

            {/* Scan Overlay UI (Visual only) */}
            {status === "idle" && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-0">
                    <div className="w-72 h-72 border-2 border-blue-500/50 rounded-3xl relative opacity-80 backdrop-blur-[1px]">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-xl -mt-0.5 -ml-0.5" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-xl -mt-0.5 -mr-0.5" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-xl -mb-0.5 -ml-0.5" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-xl -mb-0.5 -mr-0.5" />

                        <motion.div
                            initial={{ top: "10%" }}
                            animate={{ top: ["10%", "90%", "10%"] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            className="absolute left-4 right-4 h-0.5 bg-blue-400 shadow-[0_0_20px_#60a5fa] rounded-full"
                        />
                    </div>
                    <p className="mt-8 text-neutral-300 text-sm font-medium bg-black/60 px-6 py-2 rounded-full backdrop-blur-md border border-white/10">
                        Barkodu çerçevenin içine hizalayın
                    </p>
                </div>
            )}

            {/* Confirmation Modal */}
            <AnimatePresence>
                {status === "confirm" && scannedData && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute bottom-0 left-0 right-0 bg-neutral-900 rounded-t-3xl p-8 z-20 border-t border-white/10 shadow-2xl pb-10"
                    >
                        <div className="w-16 h-1.5 bg-neutral-700/50 rounded-full mx-auto mb-8" />

                        <div className="mb-8">
                            <h3 className="text-sm text-neutral-400 font-medium uppercase tracking-wider mb-2">Giriş Yapılacak Nokta:</h3>
                            <h2 className="text-3xl font-bold text-white break-words leading-tight">{scannedData.payload.nam}</h2>
                            <p className="text-neutral-400 mt-2 text-sm">Bu cihazdan geçiş yapıyorsunuz. Onaylıyor musunuz?</p>
                            {scannedData.payload.loc && <p className="text-blue-400 mt-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> {scannedData.payload.loc}</p>}
                        </div>

                        <div className="flex gap-4">
                            <button onClick={resetScan} className="flex-1 py-4 bg-neutral-800 text-neutral-300 font-bold rounded-xl active:scale-95 transition-all mb-safe hover:bg-neutral-700">
                                İptal
                            </button>
                            <button onClick={confirmAccess} className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all mb-safe hover:bg-blue-500">
                                Onayla
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading/Success/Error Overlay */}
            <AnimatePresence>
                {status !== "idle" && status !== "confirm" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                            "absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/90 backdrop-blur-xl",
                            status === "success" && "bg-green-950/30",
                            status === "error" && "bg-red-950/30"
                        )}
                    >
                        {status === "loading" && (
                            <div className="flex flex-col items-center">
                                <div className="relative w-20 h-20 mb-6">
                                    <div className="absolute inset-0 border-4 border-neutral-800 rounded-full" />
                                    <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                                <p className="text-white font-medium animate-pulse text-lg">Doğrulanıyor...</p>
                            </div>
                        )}

                        {status === "success" && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center w-full max-w-sm"
                            >
                                <div className="w-28 h-28 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_-10px_rgba(34,197,94,0.6)]">
                                    <CheckCircle2 className="w-14 h-14 text-white" />
                                </div>
                                <h2 className="text-4xl font-bold text-white mb-2">Giriş Başarılı</h2>
                                <p className="text-green-400 text-lg">Hoş Geldiniz!</p>
                                <div className="mt-8 h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2.5 }}
                                        className="h-full bg-green-500"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {status === "error" && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center w-full max-w-sm"
                            >
                                <div className="w-28 h-28 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_-10px_rgba(239,68,68,0.6)]">
                                    <XCircle className="w-14 h-14 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">Erişim Reddedildi</h2>
                                <p className="text-red-300 mb-10 text-lg px-4">{errorMessage}</p>
                                <button onClick={resetScan} className="w-full py-4 bg-white/10 rounded-2xl text-white font-bold hover:bg-white/20 transition-colors border border-white/10">
                                    Tekrar Dene
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
