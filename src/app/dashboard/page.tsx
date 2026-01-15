"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ScanLine, LogOut, UserCircle } from "lucide-react";

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string, title: string } | null>(null);

    useEffect(() => {
        const name = localStorage.getItem("user_name");
        const title = localStorage.getItem("user_title");
        if (!name) {
            router.push("/login");
            return;
        }
        setUser({ name, title: title || "Staff" });
    }, [router]);

    if (!user) return null;

    return (
        <div className="flex flex-col min-h-screen p-6 relative">
            <header className="flex justify-between items-center mb-8 pt-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 relative rounded-full overflow-hidden border-2 border-blue-500/30 bg-neutral-900 flex items-center justify-center">
                        <UserCircle className="w-8 h-8 text-neutral-400" />
                    </div>
                    <div>
                        <h2 className="font-bold text-white leading-tight text-lg">Sn. {user.name}</h2>
                        <p className="text-xs text-blue-400 font-medium uppercase tracking-wide">{user.title}</p>
                    </div>
                </div>
                <div className="w-12 h-12" /> {/* Spacer to balance header */}
            </header>

            <main className="flex-1 flex flex-col items-center justify-start space-y-8 mt-10">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm"
                >
                    <div className="glass-card flex flex-col items-center text-center p-8 border-t border-blue-500/20 relative overflow-hidden group cursor-pointer" onClick={() => router.push("/scan")}>
                        <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />

                        <div className="mb-6 relative">
                            <div className="absolute inset-0 bg-blue-500 blur-[50px] opacity-20" />
                            <button
                                className="relative w-32 h-32 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-600/30 transition-all active:scale-95 group-hover:shadow-blue-600/50 group-hover:scale-105"
                            >
                                <ScanLine size={48} className="text-white" />
                            </button>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">QR Tara</h3>
                        <p className="text-neutral-400 text-sm max-w-[200px]">Geçiş yapmak için Kiosk üzerindeki kodu okutun.</p>
                    </div>
                </motion.div>

                {/* Recent Activity Mock */}
                <div className="w-full max-w-sm">
                    <h4 className="text-xs font-bold text-neutral-500 mb-4 uppercase tracking-widest ml-1">Son Geçişler</h4>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                className="glass p-4 rounded-xl flex items-center justify-between border-l-2 border-l-blue-500/50"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                    <div>
                                        <p className="text-sm font-medium text-white">Ana Kapı</p>
                                        <p className="text-[10px] text-neutral-500 uppercase font-semibold">Bugün, 08:{30 + i * 5}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-mono text-neutral-600 bg-neutral-900/50 px-2 py-1 rounded">ID: #{2938 + i}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
