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
    // ... other standard claims
}

export default function ScanPage() {
    const router = useRouter();
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [mounted, setMounted] = useState(false);
    const [scannedData, setScannedData] = useState<{ raw: string; payload: JWTPayload } | null>(null);
    const [status, setStatus] = useState<"idle" | "confirm" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [logs, setLogs] = useState<string[]>([]); // Network Logs
    const [successMessage, setSuccessMessage] = useState("Hoş Geldiniz!");

    const addLog = (message: string) => {
        const time = new Date().toLocaleTimeString().split(' ')[0];
        setLogs(prev => [`[${time}] ${message}`, ...prev]);
        console.log(`[${time}] ${message}`);
    };

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
            setErrorMessage("Kamera izni gerekiyor.");
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
            // STOP FIRST: This prevents double scans immediately
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.pause(true); // Pause instead of stop to keep video feed (prevents black screen)
            }

            const decoded = jwtDecode<JWTPayload>(rawJwt);
            // Basic validation
            if (!decoded.nam) throw new Error("QR Formatı Hatalı");

            setScannedData({ raw: rawJwt, payload: decoded });
            setStatus("confirm");
        } catch (e) {
            addLog("❌ QR Okuma Hatası: Format geçersiz");
            // Optionally show toast 'Invalid QR', but for now assume good QR
            if (scannerRef.current) scannerRef.current.resume();
        }
    };

    const confirmAccess = async () => {
        if (!scannedData) return;
        setStatus("loading");
        setLogs([]); // Clear logs on new attempt
        addLog("🚀 İŞLEM BAŞLATILIYOR...");

        const userId = localStorage.getItem("user_id") || "unknown";
        const userName = localStorage.getItem("user_name") || "Unknown User";
        const deviceUuid = localStorage.getItem("device_owner_tc") || "unknown-device";

        try {
            // 1. Prepare Payload
            addLog("📦 Veri Paketi Hazırlanıyor...");
            const payload = {
                qr_token: scannedData.raw.substring(0, 20) + "...", // Shorten for log
                // Real token is sent, just shortened for UI log
                full_qr_token: scannedData.raw,
                user_tc: userId,
                user_id: userId,
                user_name: userName,
                device_info: {
                    uuid: deviceUuid,
                    platform: (window.navigator as any).userAgentData?.platform || window.navigator.platform,
                    fingerprint: {
                        ua: window.navigator.userAgent,
                        language: window.navigator.language,
                        screen: `${window.screen.width}x${window.screen.height}`,
                    },
                    timestamp: new Date().toISOString()
                }
            };

            // Fix payload structure for sending (remove logs fields)
            const sendPayload = { ...payload, qr_token: scannedData.raw };
            delete (sendPayload as any).full_qr_token;

            addLog(`📋 TC: ${userId}`);
            addLog(`📋 Cihaz: ${deviceUuid}`);

            // 2. Determine URL - FIXED
            const fullApiUrl = "https://kiosk.fokusistatistik.com/kiosk/api/mobile/scan";

            addLog(`🔗 Hedef: ${fullApiUrl}`);
            addLog("📡 Veri Sunucuya Gönderiliyor...");

            // 3. Send Request
            const startTime = Date.now();
            const response = await fetch(fullApiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sendPayload),
                signal: AbortSignal.timeout(15000) // 15 sec timeout
            });
            const duration = Date.now() - startTime;

            addLog(`📥 Cevap Geldi! Süre: ${duration}ms`);
            addLog(`🔢 HTTP Durumu: ${response.status} ${response.statusText}`);

            // 4. Parse Response
            const textBody = await response.text();
            addLog(`📄 Ham Cevap: ${textBody.substring(0, 100)}${textBody.length > 100 ? '...' : ''}`);

            let data: any = {};
            try {
                data = JSON.parse(textBody);
            } catch (jsonErr) {
                addLog("⚠️ JSON Parse Hatası! Cevap JSON formatında değil.");
            }

            // 5. Handle Logic
            if (response.status === 200) {
                if (data.success === true) {
                    addLog("✅ BAŞARILI: Backend onayı verdi.");
                    addLog(`💬 Mesaj: ${data.message}`);
                    setSuccessMessage(data.message || "Giriş Başarılı");
                    setStatus("success");
                    setTimeout(() => router.push("/dashboard"), 3000);
                } else {
                    addLog("❌ REDDEDİLDİ: HTTP 200 ama success:false");
                    addLog(`💬 Hata: ${data.message}`);
                    throw new Error(data.message || "Backend onayı reddetti");
                }
            } else {
                addLog(`⛔ HATA: Sunucu ${response.status} döndü.`);
                let errMsg = "Sunucu Hatası";
                if (response.status === 404) errMsg = "Kayıt Bulunamadı";
                if (response.status === 403) errMsg = "Erişim Engellendi (403)";

                setErrorMessage(data.message || data.error || errMsg);
                throw new Error(data.message || errMsg);
            }

        } catch (error: any) {
            console.error(error);
            addLog(`💥 İSTİSNA: ${error.name}`);
            addLog(`📝 Detay: ${error.message}`);

            if (error.name === "AbortError") {
                setErrorMessage("Zaman Aşımı: Sunucu 15sn içinde cevap vermedi.");
            } else if (error.message.includes("Failed to fetch") || error.message.includes("Load failed")) {
                setErrorMessage("Bağlantı Hatası: Sunucuya ulaşılamadı. İnterneti kontrol edin.");
            } else {
                setErrorMessage(error.message || "Bilinmeyen İletişim Hatası");
            }
            setStatus("error");
        }
    };

    const resetScan = () => {
        setScannedData(null);
        setErrorMessage("");
        setStatus("idle");
        // Don't clear logs immediately so user can read them
        if (scannerRef.current) {
            try { scannerRef.current.resume(); }
            catch (e) { setMounted(false); setTimeout(() => setMounted(true), 10); }
        }
    };

    return (
        <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-8 flex justify-between items-center bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                <button onClick={() => router.back()} className="text-white bg-white/10 p-3 rounded-full backdrop-blur-md active:bg-white/20 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-white bg-black/50 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-white/10 backdrop-blur-md">QR TARA</span>
                </div>
                <div className="w-12" />
            </div>

            {/* Camera Container */}
            <div className="flex-1 bg-black relative flex items-center justify-center">
                {mounted && <div id="reader" className="w-[100vw] h-[100vh] object-cover" />}
            </div>

            {/* Scan Overlay UI */}
            {status === "idle" && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-0">
                    <div className="w-72 h-72 border-2 border-blue-500/50 rounded-3xl relative opacity-80 backdrop-blur-[1px]">
                        <motion.div
                            initial={{ top: "10%" }}
                            animate={{ top: ["10%", "90%", "10%"] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            className="absolute left-4 right-4 h-0.5 bg-blue-400 shadow-[0_0_20px_#60a5fa] rounded-full"
                        />
                    </div>
                    <p className="mt-8 text-neutral-300 text-sm font-medium bg-black/60 px-6 py-2 rounded-full backdrop-blur-md border border-white/10">
                        Barkodu hizalayın
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

            {/* STATUS & LOGS OVERLAY */}
            <AnimatePresence>
                {(status === "loading" || status === "success" || status === "error") && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                            "absolute inset-0 z-30 flex flex-col bg-black/95 backdrop-blur-xl pt-20 pb-8 px-6",
                            status === "success" && "bg-green-950/90",
                            status === "error" && "bg-red-950/90"
                        )}
                    >
                        {/* Status Icon Area */}
                        <div className="flex-shrink-0 flex flex-col items-center justify-center mb-6">
                            {status === "loading" && <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />}
                            {status === "success" && <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />}
                            {status === "error" && <XCircle className="w-16 h-16 text-red-500 mb-4" />}

                            <h2 className="text-2xl font-bold text-white text-center">
                                {status === "loading" && "Sunucu ile İletişim..."}
                                {status === "success" && "Giriş Başarılı"}
                                {status === "error" && "Bağlantı Sorunu"}
                            </h2>
                            {errorMessage && <p className="text-red-300 text-center mt-2 text-sm">{errorMessage}</p>}
                            {status === "success" && <p className="text-green-300 text-center mt-2">{successMessage}</p>}
                        </div>

                        {/* LIVE LOG TERMINAL */}
                        <div className="flex-1 bg-black/50 rounded-xl border border-white/10 overflow-hidden flex flex-col font-mono text-[10px] md:text-xs">
                            <div className="bg-white/10 px-4 py-2 flex justify-between items-center">
                                <span className="text-blue-300 font-bold">CANLI BAĞLANTI LOGLARI</span>
                                {status === "error" && <button onClick={resetScan} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-white">KAPAT</button>}
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-white/20">
                                {logs.length === 0 && <span className="text-neutral-500 italic">...Log bekleniyor...</span>}
                                {logs.map((log, i) => (
                                    <div key={i} className={cn(
                                        "break-all border-l-2 pl-2",
                                        log.includes("✅") ? "text-green-400 border-green-500" :
                                            log.includes("❌") || log.includes("⛔") || log.includes("💥") ? "text-red-400 border-red-500" :
                                                log.includes("🚀") || log.includes("📡") ? "text-blue-400 border-blue-500" :
                                                    "text-neutral-400 border-neutral-700"
                                    )}>
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {status === "error" && (
                            <button onClick={resetScan} className="mt-4 w-full py-4 bg-white/10 rounded-xl text-white font-bold hover:bg-white/20 border border-white/10">
                                Tekrar Dene
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
