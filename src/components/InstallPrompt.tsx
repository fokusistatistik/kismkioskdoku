"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share, PlusSquare } from "lucide-react";

export default function InstallPrompt() {
    const [isStandalone, setIsStandalone] = useState(true);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if running in standalone mode
        const checkStandalone = () => {
            const isStandaloneMode =
                window.matchMedia("(display-mode: standalone)").matches ||
                (window.navigator as any).standalone === true;

            setIsStandalone(isStandaloneMode);
        };

        checkStandalone();
        window.matchMedia("(display-mode: standalone)").addEventListener("change", checkStandalone);

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        setIsIOS(/iphone|ipad|ipod/.test(userAgent));

        // Capture install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsStandalone(false); // Force show if install logic triggers
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setDeferredPrompt(null);
            }
        }
    };

    const handleOpenApp = () => {
        // Attempt to open PWA via intent or new window
        // On Android, navigating to the manifest start_url might trigger the Intent Picker if installed
        window.location.href = "/dashboard";
    };

    if (isStandalone) return null;

    return (
        <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full"
            >
                <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className="absolute inset-0 bg-blue-500 blur-[60px] opacity-40 rounded-full" />
                    <Image
                        src="/logo.png"
                        alt="DOKU App Icon"
                        fill
                        className="object-contain drop-shadow-2xl relative z-10"
                        priority
                    />
                </div>

                <h1 className="text-3xl font-bold text-white mb-4">DOKU'ya Geçiş Yapın</h1>
                <p className="text-neutral-400 mb-10 leading-relaxed">
                    Sisteme erişmek için mobil uygulamayı kullanmanız gerekmektedir.
                </p>

                <div className="space-y-4">
                    {/* Install Button - Show if browser supports programmatic install */}
                    {!isIOS && deferredPrompt && (
                        <button
                            onClick={handleInstallClick}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 animate-pulse"
                        >
                            <Download size={24} />
                            Uygulamayı Yükle
                        </button>
                    )}

                    {/* iOS Instructions */}
                    {isIOS && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                                    <Share size={24} />
                                </div>
                                <div>
                                    <p className="text-white font-medium">1. "Paylaş" butonuna basın</p>
                                    <p className="text-xs text-neutral-500">Tarayıcının alt menüsünde bulunur.</p>
                                </div>
                            </div>
                            <div className="w-full h-px bg-white/5" />
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                                    <PlusSquare size={24} />
                                </div>
                                <div>
                                    <p className="text-white font-medium">2. "Ana Ekrana Ekle"yi seçin</p>
                                    <p className="text-xs text-neutral-500">Menüyü yukarı kaydırarak bulabilirsiniz.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Open App / Alternative - Show if we suspect it's installed or prompt is missing */}
                    {(!deferredPrompt && !isIOS) && (
                        <button
                            onClick={handleOpenApp}
                            className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-4 rounded-xl border border-white/10 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <Share size={24} className="rotate-90" />
                            Zaten Yüklü mü? Uygulamayı Aç
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
