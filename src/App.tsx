import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Minus,
  Sparkles,
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  History,
  Calendar,
  AlertCircle,
  TrendingUp,
  Award,
  Flag,
  Share2,
  ListFilter,
  Check,
  Star,
  Smartphone,
  Download,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Profile, HistoryLog } from "./types";
import { ProfileCard } from "./components/ProfileCard";
import { QuickGuide } from "./components/QuickGuide";
import { AchievementList } from "./components/AchievementList";
import {
  playStickerSound,
  playNegativeSound,
  playSuccessSound,
  toggleGlobalMute,
  isMuted as checkMutedGlobal
} from "./utils/audio";

const TOTAL_STICKERS = 980;

// Helper to spawn temporary floating star particles
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

export default function App() {
  // --- 1. STATE INITIALIZATION ---
  const [stickerCount, setStickerCount] = useState<number>(() => {
    const saved = localStorage.getItem("mundial2026_sticker_count");
    if (saved) {
      const parsed = parseInt(saved, 10);
      return isNaN(parsed) ? 0 : Math.min(Math.max(parsed, 0), TOTAL_STICKERS);
    }
    return 0;
  });

  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem("mundial2026_profile_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      name: "Mi Pequeño Campeón",
      avatar: "⚽",
      favoriteTeam: "Mundial Celeste",
    };
  });

  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>(() => {
    const saved = localStorage.getItem("mundial2026_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [];
  });

  const [audioMuted, setAudioMuted] = useState<boolean>(() => {
    return checkMutedGlobal();
  });

  // Modal display states
  const [showResetModal, setShowResetModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [customInputValue, setCustomInputValue] = useState<string>("");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [unlockedBanner, setUnlockedBanner] = useState<string | null>(null);

  // PWA states and setup
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);
  const [dismissedPwa, setDismissedPwa] = useState<boolean>(() => {
    return localStorage.getItem("mundial2026_dismissed_pwa") === "true";
  });

  useEffect(() => {
    const isInStandaloneMode = () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone ||
      document.referrer.includes('android-app://');

    if (isInStandaloneMode()) {
      setIsAppInstalled(true);
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsAppInstalled(false);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsAppInstalled(true);
        }
      } catch (err) {
        console.error("Installation choice error:", err);
      }
      setDeferredPrompt(null);
    }
  };

  const handleClosePwaBanner = () => {
    setDismissedPwa(true);
    localStorage.setItem("mundial2026_dismissed_pwa", "true");
  };

  // Sound and local persistence syncs
  useEffect(() => {
    localStorage.setItem("mundial2026_sticker_count", stickerCount.toString());
  }, [stickerCount]);

  useEffect(() => {
    localStorage.setItem("mundial2026_profile_v2", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("mundial2026_history", JSON.stringify(historyLogs));
  }, [historyLogs]);

  // Track stickerCount transitions to trigger special achievement celebrations
  const prevCountRef = useRef<number>(stickerCount);

  useEffect(() => {
    const prev = prevCountRef.current;
    if (stickerCount > prev) {
      // Check if an achievement threshold was freshly surpassed:
      const checkThreshold = (val: number, threshold: number) => prev < threshold && val >= threshold;

      let milestone = "";
      if (checkThreshold(stickerCount, 10)) {
        milestone = "¡Puntapié Inicial! 🌟 (10 Cromos)";
      } else if (checkThreshold(stickerCount, 100)) {
        milestone = "¡Hinchada Fiel! ❤️ (100 Cromos)";
      } else if (checkThreshold(stickerCount, 245)) {
        milestone = "¡Cuarto de Cancha! 🏆 (25% del Álbum)";
      } else if (checkThreshold(stickerCount, 490)) {
        milestone = "¡Medio Tiempo! ⚔️ (50% del Álbum)";
      } else if (checkThreshold(stickerCount, 735)) {
        milestone = "¡Casi en la Final! 👑 (75% del Álbum)";
      } else if (checkThreshold(stickerCount, 980)) {
        milestone = "🏆 ¡ÁLBUM COMPLETO! ¡CAMPEÓN DEL MUNDO! 🏆";
      }

      if (milestone) {
        setUnlockedBanner(milestone);
        playSuccessSound();
        // Clear banner after 5s
        setTimeout(() => setUnlockedBanner(null), 5000);
      }
    }
    prevCountRef.current = stickerCount;
  }, [stickerCount]);

  // --- 2. LOGIC HANDLERS ---
  const handleStickerChange = (change: number) => {
    const newCount = Math.min(Math.max(stickerCount + change, 0), TOTAL_STICKERS);
    
    if (newCount === stickerCount) return; // No change

    if (change > 0) {
      // Spawn delightful visual sparkles from where click originated
      spawnParticles();
      // Increase sound pitch depending on sticker count progress
      const pitch = 1 + (stickerCount / TOTAL_STICKERS) * 0.5;
      playStickerSound(pitch);
    } else {
      playNegativeSound();
    }

    // Add entry to history log
    const newLog: HistoryLog = {
      id: Math.random().toString(36).substring(4),
      timestamp: new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      change: change,
      newCount: newCount,
    };

    setStickerCount(newCount);
    setHistoryLogs((prev) => [newLog, ...prev.slice(0, 9)]); // Keep last 10 logs
    setCustomInputValue("");
  };

  const handleManualInputSave = () => {
    const parsed = parseInt(customInputValue, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= TOTAL_STICKERS) {
      const change = parsed - stickerCount;
      if (change === 0) return;
      
      handleStickerChange(change);
    } else {
      playNegativeSound();
    }
  };

  const spawnParticles = () => {
    const colors = ["#f4be2c", "#d92231", "#ffffff", "#4caf50", "#2e7d32", "#15305b"];
    const newParticles: Particle[] = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x: 35 + Math.random() * 30, // Percentage width
      y: 40 + Math.random() * 20, // Percentage height
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setParticles((prev) => [...prev, ...newParticles]);
    // Clear particles after 1.2s animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1200);
  };

  const handleResetApp = () => {
    setStickerCount(0);
    setHistoryLogs([]);
    setProfile({
      name: "Mi Pequeño Campeón",
      avatar: "⚽",
      favoriteTeam: "Mundial Celeste",
    });
    playNegativeSound();
    setShowResetModal(false);
  };

  const toggleMute = () => {
    const isMutedNow = toggleGlobalMute();
    setAudioMuted(isMutedNow);
  };

  // --- 3. METRIC CALCULATIONS ---
  const stickersLeft = TOTAL_STICKERS - stickerCount;
  const progressPercent = Math.min((stickerCount / TOTAL_STICKERS) * 100, 100);
  const formattedPercent = progressPercent.toFixed(1);

  // Fun quote according to progress level
  const getMotivationalQuote = () => {
    if (stickerCount === 0) {
      return "¡Puntapié inicial! Prepárate para el viaje de tu vida ⚽";
    }
    if (stickerCount === TOTAL_STICKERS) {
      return "👑 ¡LOGRO LEGENDARIO! Has completado el álbum del Mundial 2026. ¡Somos campeones!";
    }
    if (progressPercent >= 75) {
      return "🔥 ¡El estadio ruge! Estás a un paso de la gran gloria mundialista. ¡Sigue pegando!";
    }
    if (progressPercent >= 50) {
      return "✨ ¡Segunda mitad del partido! Tu álbum ya brilla con grandes estrellas del fútbol.";
    }
    if (progressPercent >= 25) {
      return "💪 ¡Gran avance en el terreno! Ya tienes un cuarto de la cancha completado.";
    }
    return "⚽ ¡Vamos Campeón! Cada pegatina es un gol para tu colección.";
  };

  return (
    <div className="min-h-screen bg-[#f3f6f9] text-gray-800 font-sans pb-16 relative overflow-x-hidden selection:bg-mundial-gold selection:text-mundial-blue-dark">
      
      {/* Visual Background Accent Lines resembling a world cup court & grass */}
      <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-mundial-blue-dark to-mundial-blue z-0" />
      <div className="absolute top-2 right-2 flex gap-4 text-white/5 font-display text-9xl font-black select-none pointer-events-none z-0">
        USA MEX CAN
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6 relative z-10">
        
        {/* --- DYNAMIC UNLOCKED ACHIEVEMENT BANNER --- */}
        <AnimatePresence>
          {unlockedBanner && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="bg-gradient-to-r from-mundial-gold via-yellow-300 to-mundial-gold border-4 border-white text-mundial-blue-dark shadow-2xl p-4 rounded-2xl flex items-center gap-3 justify-center z-50 text-center relative"
            >
              <Trophy className="w-8 h-8 text-mundial-blue animate-bounce shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8b6508]">
                  🏆 ¡HITO DESBLOQUEADO!
                </p>
                <h3 className="font-display font-black text-lg md:text-xl leading-tight">
                  {unlockedBanner}
                </h3>
              </div>
              <Sparkles className="w-6 h-6 text-mundial-blue animate-pulse shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- APPLICATION HEADER --- */}
        <header id="app-header" className="flex items-center justify-between text-white pb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-md border-3 border-mundial-gold flex items-center justify-center rotate-3 transform hover:rotate-0 transition-transform duration-300">
              <span className="text-3xl">⚽</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-mundial-red font-black tracking-widest px-2 py-0.5 rounded-full uppercase text-white shadow-sm border border-white/10 animate-pulse">
                  MUNDIAL '26
                </span>
              </div>
              <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight text-white text-shadow-sm leading-none mt-1">
                Control de Álbum
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle button */}
            <button
              id="audio-toggle-btn"
              onClick={toggleMute}
              className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center ${
                audioMuted
                  ? "bg-white/10 border-white/20 text-white/60 hover:bg-white/20"
                  : "bg-mundial-gold border-mundial-gold-dark text-mundial-blue-dark hover:scale-105"
              }`}
              title={audioMuted ? "Activar sonidos deportivos" : "Silenciar sonidos"}
            >
              {audioMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Share action button */}
            <button
              id="share-badge-btn"
              onClick={() => setShowShareModal(true)}
              className="bg-mundial-grass text-white border-2 border-green-600 hover:bg-green-600 font-extrabold text-sm uppercase p-2.5 rounded-xl cursor-pointer shadow-sm flex items-center gap-1.5 hover:scale-105 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Compartir</span>
            </button>
          </div>
        </header>

        {/* --- PWA APP INSTALL BANNER --- */}
        {!isAppInstalled && !dismissedPwa && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            className="bg-gradient-to-r from-mundial-blue-dark to-mundial-blue border-3 border-mundial-gold rounded-2xl p-4.5 shadow-xl text-white relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            {/* Background design accents */}
            <div className="absolute -bottom-6 -right-6 text-7xl opacity-5 select-none pointer-events-none">
              ⚽
            </div>
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-mundial-gold/5 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-start gap-3.5 relative z-10 w-full sm:w-auto">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6 text-mundial-gold animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-white text-xs font-black font-display tracking-tight flex items-center gap-1">
                    <span>Álbum 2026</span>
                    <span className="text-mundial-gold">★</span>
                  </span>
                </div>
                <h3 className="font-display font-black text-sm text-shadow-sm leading-tight text-white">
                  {deferredPrompt ? "¡Colecciona en tu celular con App directa!" : "Instalar en tu celular"}
                </h3>
                
                {/* Visual guidelines ONLY if the browser DOES NOT support automatic installation */}
                {!deferredPrompt && (
                  <p className="text-[11px] text-gray-200 leading-normal max-w-lg font-medium">
                    <span className="flex items-start gap-1 font-semibold text-mundial-light-gold">
                      <span>💡</span>
                      <span>Toca compartir y luego "Agregar a pantalla de inicio" para instalar.</span>
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-center justify-end relative z-10">
              {deferredPrompt && (
                <button
                  id="install-pwa-action-btn"
                  onClick={handleInstallClick}
                  className="bg-mundial-gold hover:bg-yellow-400 active:scale-95 text-mundial-blue-dark font-black text-sm uppercase px-5 py-3 rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-2 border-b-4 border-mundial-gold-dark"
                >
                  <span>📲</span>
                  <span>Instalar App</span>
                </button>
              )}
              
              <button
                id="close-pwa-banner-btn"
                onClick={handleClosePwaBanner}
                className="bg-white/10 hover:bg-white/20 active:scale-95 text-white/85 p-2.5 rounded-xl cursor-pointer transition-all border border-white/10"
                title="Cerrar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* --- MAIN PITCH PANEL: LEAGUE SCOREBOARD --- */}
        <main
          id="main-scoreboard-pitch"
          className="bg-white rounded-3xl border-3 border-mundial-blue shadow-2xl overflow-hidden relative"
        >
          {/* Soccer pitch theme background header block with stadium spotlights */}
          <div className="bg-gradient-to-b from-[#1b5e20] via-mundial-green to-[#124116] p-6 sm:p-8 text-white relative">
            
            {/* Corner Flags visual aids in the background */}
            <div className="absolute top-2 left-2 text-xs opacity-20 font-bold select-none pointer-events-none">⛳</div>
            <div className="absolute top-2 right-2 text-xs opacity-20 font-bold select-none pointer-events-none">⛳</div>
            
            {/* Chalk white stadium outlines and kickoff circle overlay */}
            <div className="absolute inset-0 border-4 border-white/20 m-2 rounded-2xl pointer-events-none" />
            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/20 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-2 border-white/25 pointer-events-none flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
            </div>

            {/* Glowing Spotlight effect from top center */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-white/10 rounded-full filter blur-xl pointer-events-none" />

            {/* Particle Sparks Render relative container */}
            <div className="absolute inset-x-0 top-0 h-full pointer-events-none overflow-hidden">
              {particles.map((particle) => (
                <span
                  key={particle.id}
                  className="absolute w-3 h-3 rounded-full animate-ping pointer-events-none opacity-80"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    backgroundColor: particle.color,
                    boxShadow: `0 0 8px ${particle.color}`,
                    animationDuration: "1s",
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 text-center space-y-5">
              <div className="flex items-center justify-center gap-1.5">
                <span className="bg-mundial-red text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase shadow-md border border-white/20 animate-pulse">
                  🏆 CAMINO A LA COPA MUNDIAL 2026
                </span>
              </div>
              
              {/* Massive stadium scores layout designed like high tech scoreboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 md:gap-4 pt-2">
                
                {/* Score Left: Stuck stickers */}
                <div id="stat-pegados-box" className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/15 p-4 space-y-1">
                  <p className="text-emerald-350 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1">
                    <span>🌟 Pegados</span>
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-display font-black text-5xl sm:text-6xl tracking-tighter text-white drop-shadow">
                      {stickerCount}
                    </span>
                    <span className="text-sm text-emerald-200 font-bold">/ {TOTAL_STICKERS}</span>
                  </div>
                  <p className="text-[10px] text-emerald-200 font-semibold">¡Suma en el verde!</p>
                </div>

                {/* Center score comparison: Real time percentage complete */}
                <div id="stat-porcentaje-box" className="bg-gradient-to-b from-[#15305b] to-mundial-blue border-3 border-mundial-gold rounded-2xl p-4 shrink-0 mx-auto w-full max-w-[210px] shadow-lg relative overflow-hidden">
                  {/* Decorative diagonal sport stripes on badge */}
                  <div className="absolute inset-0 bg-white/5 skew-y-12 pointer-events-none" />
                  
                  <p className="text-[9px] text-[#f4be2c] uppercase font-black tracking-widest relative z-10">
                    COMPLETADO
                  </p>
                  
                  <h3 className="font-display font-black text-4.5xl text-mundial-gold drop-shadow-md mt-0.5 tracking-tight relative z-10">
                    {formattedPercent}%
                  </h3>
                  
                  <div className="flex items-center justify-center gap-1 mt-1 font-mono text-[10px] text-white/95 bg-black/20 py-0.5 px-2 rounded-full relative z-10 w-fit mx-auto">
                    <span className="text-mundial-gold">★</span>
                    <span>{progressPercent >= 100 ? "¡ÁLBUM DE ORO!" : "CLUB MUNDIALISTA"}</span>
                  </div>
                </div>

                {/* Score Right: Missing stickers */}
                <div id="stat-faltantes-box" className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/15 p-4 space-y-1">
                  <p className="text-rose-200 font-black text-xs uppercase tracking-wider">
                    ❓ Faltan
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-display font-black text-5xl sm:text-6xl tracking-tighter text-rose-200 drop-shadow">
                      {stickersLeft}
                    </span>
                    <span className="text-xs text-rose-100 font-bold uppercase">cromos</span>
                  </div>
                  <p className="text-[10px] text-rose-200 font-semibold">de un total de {TOTAL_STICKERS}</p>
                </div>

              </div>

              {/* Progress bar and grass visual effects - Designed like a race path to the actual cup! */}
              <div className="space-y-2 max-w-xl mx-auto pt-3">
                <div className="flex items-center justify-between text-[11px] font-black uppercase text-emerald-100 tracking-wider">
                  <span className="flex items-center gap-1">
                    <Flag className="w-3.5 h-3.5 text-mundial-gold fill-mundial-gold animate-bounce" />
                    Banderazo de Salida (0)
                  </span>
                  <span className="flex items-center gap-1 text-mundial-gold">
                    La Gran Final (980)
                    <Trophy className={`w-3.5 h-3.5 ${progressPercent >= 100 ? "text-yellow-300 animate-spin" : "text-mundial-gold"}`} />
                  </span>
                </div>

                {/* The visual custom grass bar stylized as a football pitch line with white yard hashes */}
                <div className="flex items-center gap-3">
                  <div className="w-full h-7 bg-emerald-950 rounded-2xl p-1 border-2.5 border-white/30 select-none relative overflow-hidden shadow-inner">
                    
                    {/* Lawn stripe visual representation (10 green markers) */}
                    <div className="absolute inset-x-0 inset-y-0 flex justify-between pointer-events-none opacity-20">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="w-px h-full bg-white" />
                      ))}
                    </div>

                    <div
                      className="h-full rounded-xl bg-gradient-to-r from-mundial-grass via-[#66bb6a] to-emerald-400 relative transition-all duration-700 ease-out flex items-center justify-end pr-2 overflow-hidden shadow-sm"
                      style={{ width: `${progressPercent}%`, minWidth: stickerCount > 0 ? "8%" : "0%" }}
                    >
                      {/* Interactive soccer ball sliding down the pitch lines */}
                      {stickerCount > 0 && (
                        <span className="absolute right-1.5 text-lg leading-none filter drop-shadow animate-bounce" style={{ animationDuration: "0.8s" }}>
                          ⚽
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Shiny Golden Trophy sitting proud at the end of the stadium lane! */}
                  <div 
                    className={`p-2 rounded-xl border-2 transition-all duration-300 shrink-0 ${
                      progressPercent >= 100 
                        ? "bg-mundial-gold border-white text-mundial-blue-dark scale-110 shadow-lg animate-bounce" 
                        : "bg-mundial-blue-dark border-mundial-gold/40 text-mundial-gold opacity-85"
                    }`}
                    title="¡La Gran Copa Mundial!"
                  >
                    <Trophy className={`w-5 h-5 ${progressPercent >= 100 ? "fill-current animate-pulse" : ""}`} />
                  </div>
                </div>
              </div>

              <p className="text-xs italic text-emerald-100 font-semibold max-w-lg mx-auto bg-black/15 py-1 px-4 rounded-full w-fit">
                ⚽ "{getMotivationalQuote()}"
              </p>
            </div>
          </div>

          {/* --- COUNTER CONTROLS SECTION --- */}
          <div className="p-6 space-y-6">
            <h4 className="text-center font-display font-extrabold text-mundial-blue tracking-tight text-lg">
              🎯 ¡Añade o Corrige tus Cromos Pegados!
            </h4>

            {/* Main bulky buttons for kids (+1 Pegado and -1 Corregir) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Plus button (+1 cromo Pegado) */}
              <button
                id="sumar-cromo-button"
                onClick={() => handleStickerChange(1)}
                disabled={stickerCount >= TOTAL_STICKERS}
                className={`py-5 px-6 rounded-2xl font-display font-black text-xl md:text-2xl uppercase tracking-widest shadow-lg transition-all duration-150 transform active:scale-95 flex items-center justify-center gap-3 cursor-pointer select-none border-b-6 border-green-800 ${
                  stickerCount >= TOTAL_STICKERS
                    ? "bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed"
                    : "bg-[#4caf50] hover:bg-emerald-500 text-white hover:-translate-y-0.5 active:translate-y-1 active:border-b-2 ring-4 ring-green-400/20"
                }`}
              >
                <span className="animate-bounce">⚽</span>
                <span className="tracking-tight">¡PEGADO! (+1)</span>
                <span className="animate-bounce">⚽</span>
              </button>

              {/* Minus button (-1 para corregir) */}
              <button
                id="restar-cromo-button"
                onClick={() => handleStickerChange(-1)}
                disabled={stickerCount <= 0}
                className={`py-5 px-6 rounded-2xl font-display font-bold text-lg md:text-xl uppercase tracking-wider shadow-md transition-all duration-150 transform active:scale-95 flex items-center justify-center gap-3 cursor-pointer select-none border-b-6 border-rose-800 ${
                  stickerCount <= 0
                    ? "bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed"
                    : "bg-mundial-red hover:bg-red-500 text-white hover:-translate-y-0.5 active:translate-y-1 active:border-b-2"
                }`}
              >
                <Minus className="w-5 h-5 stroke-[4px] text-rose-200" />
                <span className="tracking-tight">Corregir (-1)</span>
              </button>

            </div>

            {/* Friendly Multipliers block (Parent friendly, groups of 5) */}
            <div id="quick-multipliers-container" className="bg-mundial-grass-light/45 rounded-2xl p-4 border border-mundial-grass/20 space-y-3">
              <div className="text-center md:text-left space-y-1">
                <p className="text-xs text-mundial-blue font-black uppercase tracking-wider flex items-center gap-1.5 justify-center md:justify-start">
                  <ListFilter className="w-4 h-4 text-mundial-green" />
                  <span>Avance rápido</span>
                </p>
                <p className="text-[11px] text-gray-500 font-bold leading-tight">
                  Suma varios cromos pegados de una sola vez
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <button
                  id="plus-5-btn"
                  onClick={() => handleStickerChange(5)}
                  disabled={stickerCount >= TOTAL_STICKERS}
                  className="bg-white hover:bg-emerald-50 border-2 border-mundial-grass hover:border-emerald-600 active:scale-95 text-mundial-green font-black text-xs uppercase px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Sumar 5 (+5)</span>
                </button>

                <button
                  id="plus-10-btn"
                  onClick={() => handleStickerChange(10)}
                  disabled={stickerCount >= TOTAL_STICKERS}
                  className="bg-white hover:bg-emerald-50 border-2 border-mundial-grass hover:border-emerald-600 active:scale-95 text-mundial-green font-black text-xs uppercase px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Sumar 10 (+10)</span>
                </button>

                <button
                  id="minus-5-btn"
                  onClick={() => handleStickerChange(-5)}
                  disabled={stickerCount < 5}
                  className="bg-white hover:bg-rose-50 border-2 border-mundial-red hover:border-red-600 active:scale-95 text-mundial-red font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Quitar 5 (-5)</span>
                </button>

                <button
                  id="set-complete-shortcut"
                  onClick={() => {
                    const diff = TOTAL_STICKERS - stickerCount;
                    if (diff > 0) handleStickerChange(diff);
                  }}
                  disabled={stickerCount === TOTAL_STICKERS}
                  className="bg-mundial-gold text-mundial-blue-dark hover:bg-yellow-400 border-2 border-mundial-gold-dark font-black text-xs uppercase px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Llenar Álbum</span>
                </button>
              </div>
            </div>

            {/* Manual correction direct count setup */}
            <div id="manual-correction-box" className="pt-2 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center md:text-left">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  ¿Quieres fijar el número exacto manualmente?
                </p>
                <p className="text-[11px] text-gray-400">
                  Suma o edita de golpe para saltar a un avance específico de tu álbum.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  id="custom-count-input"
                  type="number"
                  min="0"
                  max={TOTAL_STICKERS}
                  value={customInputValue}
                  onChange={(e) => setCustomInputValue(e.target.value)}
                  placeholder={`Ej. 150`}
                  className="w-full md:w-28 px-3 py-2 border-2 border-gray-200 rounded-xl font-bold font-mono focus:outline-none focus:border-mundial-blue"
                />
                <button
                  id="apply-custom-count-btn"
                  onClick={handleManualInputSave}
                  className="bg-mundial-blue text-white hover:bg-mundial-blue-dark active:scale-95 font-black text-xs uppercase px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Guardar
                </button>
              </div>
            </div>

          </div>
        </main>

        {/* --- SHARABLE SCORE TICKET DISPLAY IF SHOWN --- */}
        <AnimatePresence>
          {showShareModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl border-3 border-mundial-gold shadow-2xl p-6 w-full max-w-md space-y-6 relative overflow-hidden"
              >
                {/* Visual Stadium decoration behind ticket */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-mundial-gold/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-mundial-red/10 rounded-full blur-2xl" />

                <div className="text-center space-y-1">
                  <span className="text-4xl">🎫</span>
                  <p className="text-[10px] bg-mundial-gold/20 text-mundial-gold-dark font-black px-2 mt-2 py-0.5 rounded-full inline-block uppercase">
                    Pase de Coleccionista Oficial
                  </p>
                  <h3 className="font-display font-black text-xl text-mundial-blue">
                    Ficha de Logros Compartible
                  </h3>
                  <p className="text-xs text-gray-400">
                    Sácale una captura de pantalla a tu tarjeta para fardar de avance con amigos.
                  </p>
                </div>

                {/* THE TICKET DESIGN */}
                <div className="bg-[#fdf9ef] border-3 border-dashed border-mundial-blue-dark rounded-2xl p-5 relative">
                  {/* Outer semicircles for ticket punches */}
                  <div className="absolute -left-[14px] top-1/2 -mt-3.5 w-6 h-7 bg-white border-r-3 border-dashed border-mundial-blue-dark rounded-r-full" />
                  <div className="absolute -right-[14px] top-1/2 -mt-3.5 w-6 h-7 bg-white border-l-3 border-dashed border-mundial-blue-dark rounded-l-full" />

                  <div className="flex items-center justify-between border-b pb-3 border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{profile.avatar}</span>
                      <div>
                        <h4 className="font-display font-black text-base text-mundial-blue leading-tight">
                          {profile.name}
                        </h4>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">
                          Socio de: {profile.favoriteTeam}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm bg-mundial-red text-white py-0.5 px-2 rounded-md font-black">
                      '26
                    </span>
                  </div>

                  <div className="py-4 text-center space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      Álbum del Mundial 2026
                    </p>
                    <div className="inline-block bg-white border border-dashed border-gray-300 p-2 rounded-xl">
                      <h4 className="font-display font-black text-4xl text-mundial-blue-dark">
                        {stickerCount} <span className="text-xs text-gray-400">cromos pegados</span>
                      </h4>
                    </div>

                    <p className="text-xs font-black text-mundial-green uppercase tracking-wide">
                      ({formattedPercent}% completado • restan {stickersLeft})
                    </p>
                  </div>

                  <div className="border-t pt-3 border-gray-200 flex items-center justify-between text-[10px] font-mono text-gray-500">
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      Guardado seguro local
                    </span>
                    <span>Código: #{Math.floor(1000 + Math.random() * 9000)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    id="close-share-btn"
                    onClick={() => setShowShareModal(false)}
                    className="w-full bg-mundial-blue text-white hover:bg-mundial-blue-dark font-black text-sm uppercase py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Cerrar Pase
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- PERSONALIZED PROFILE COMPONENT --- */}
        <section id="custom-profile-section">
          <ProfileCard profile={profile} onUpdate={setProfile} />
        </section>

        {/* --- DYNAMIC UNLOCKABLE ACHIEVEMENTS (LOGROS DE ESTADIO) --- */}
        <section id="achievements-section" className="bg-white p-5 rounded-2xl shadow-md border border-gray-200">
          <AchievementList stickerCount={stickerCount} totalStickers={TOTAL_STICKERS} />
        </section>

        {/* --- 4-STEP QUICK GUIDE FOR PARENTS AND KIDS --- */}
        <section id="quick-guide-section">
          <QuickGuide />
        </section>

        {/* --- RECENT HISTORY TRACKING LOGS (MAX 5) --- */}
        <section id="recent-history-section" className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-mundial-blue">
            <History className="w-4 h-4 text-mundial-gold" />
            <h4 className="font-display font-extrabold text-sm uppercase tracking-wide">
              Actividad Reciente
            </h4>
          </div>

          {historyLogs.length === 0 ? (
            <p className="text-xs text-gray-400 italic">
              Aún no hay cambios registrados en tus pegatinas. ¡Añade tu primer cromo!
            </p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1">
              {historyLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-black uppercase px-2 py-0.5 rounded-full ${
                      log.change > 0 ? "bg-[#e8f5e9] text-[#2e7d32]" : "bg-red-50 text-red-600"
                    }`}>
                      {log.change > 0 ? `+${log.change}` : log.change}
                    </span>
                    <span className="text-gray-600 font-medium">
                      {log.change > 1 ? "cromos sumados" : log.change === 1 ? "cromo pegado" : "cromo quitado"}
                    </span>
                  </div>

                  <div className="text-right font-mono text-[11px] text-gray-400 flex items-center gap-2">
                    <span>{log.timestamp}</span>
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">Total: {log.newCount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- RESET / REBOOT PROGRES CONTROL WITH DOUBLE CONFIRMATION --- */}
        <div className="pt-4 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-xs text-gray-500 max-w-md">
            Llevas una copia permanente de tu avance guardada en este navegador. Si deseas empezar otra vez el álbum, presiona debajo.
          </p>

          <button
            id="start-reset-modal-btn"
            onClick={() => setShowResetModal(true)}
            className="text-xs font-bold text-gray-400 bg-white hover:bg-rose-50 hover:text-mundial-red px-4 py-2 border border-gray-200 hover:border-rose-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Progreso del Álbum</span>
          </button>
        </div>

        {/* --- REAL SECURE REACT RESET MODAL MODAL (SAFELY VOIDS LOCALSTORAGE) --- */}
        <AnimatePresence>
          {showResetModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl border-3 border-mundial-red p-6 w-full max-w-sm space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-rose-50 text-mundial-red rounded-xl border border-rose-100">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-lg text-mundial-blue-dark">
                      ¿Seguro que quieres borrar?
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Esto eliminará por completo todos tus <strong>{stickerCount} cromos pegados</strong>, logros ganados e historial de juego. Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    id="cancel-reset-btn"
                    onClick={() => setShowResetModal(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase py-3 rounded-xl transition-all cursor-pointer"
                  >
                    No, Cancelar
                  </button>
                  <button
                    id="confirm-reset-btn"
                    onClick={handleResetApp}
                    className="bg-mundial-red hover:bg-red-500 text-white font-black text-xs uppercase py-3 rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    Sí, Reiniciar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
