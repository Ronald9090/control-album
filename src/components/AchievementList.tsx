import React from "react";
import { Trophy, Star, ShieldCheck, Heart, Sparkles, CheckCircle, Lock } from "lucide-react";
import { Achievement } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AchievementListProps {
  stickerCount: number;
  totalStickers: number;
}

export const AchievementList: React.FC<AchievementListProps> = ({ stickerCount, totalStickers }) => {
  const percent = totalStickers > 0 ? (stickerCount / totalStickers) * 100 : 0;

  // Let's declare our static list of achievements with programmatic checks
  const achievements = [
    {
      id: "ach_10",
      title: "Puntapié Inicial",
      description: "Pega tus primeros 10 cromos",
      target: 10,
      isPercent: false,
      isUnlocked: stickerCount >= 10,
      current: Math.min(stickerCount, 10),
      icon: Star,
      bgClass: "from-blue-500 to-indigo-600",
      rarity: "Común 🟢",
    },
    {
      id: "ach_100",
      title: "Gran Hinchada",
      description: "Suma 100 cromos en tu álbum",
      target: 100,
      isPercent: false,
      isUnlocked: stickerCount >= 100,
      current: Math.min(stickerCount, 100),
      icon: Heart,
      bgClass: "from-teal-500 to-emerald-600",
      rarity: "Poco Común 🔵",
    },
    {
      id: "ach_25",
      title: "Cuarto de Cancha",
      description: "Alcanza el 25% completado (245 cromos)",
      target: 245,
      isPercent: false,
      isUnlocked: stickerCount >= 245,
      current: Math.min(stickerCount, 245),
      icon: ShieldCheck,
      bgClass: "from-purple-500 to-violet-600",
      rarity: "Raro 🟣",
    },
    {
      id: "ach_50",
      title: "Medio Tiempo",
      description: "Alcanza el 50% completado (490 cromos)",
      target: 490,
      isPercent: false,
      isUnlocked: stickerCount >= 490,
      current: Math.min(stickerCount, 490),
      icon: Trophy,
      bgClass: "from-amber-500 to-orange-600",
      rarity: "Épico 🟠",
    },
    {
      id: "ach_75",
      title: "Cerca de la Copa",
      description: "Alcanza el 75% completado (735 cromos)",
      target: 735,
      isPercent: false,
      isUnlocked: stickerCount >= 735,
      current: Math.min(stickerCount, 735),
      icon: Sparkles,
      bgClass: "from-pink-500 to-rose-600",
      rarity: "Legendario 🔴",
    },
    {
      id: "ach_100_complete",
      title: "Campeón Mundial 2026",
      description: "¡Álbum 100% completo! (980 cromos)",
      target: 980,
      isPercent: false,
      isUnlocked: stickerCount >= 980,
      current: Math.min(stickerCount, 980),
      icon: Trophy,
      bgClass: "from-yellow-400 via-amber-500 to-yellow-600",
      rarity: "Mundialista 👑",
    },
  ];

  return (
    <div id="achievements-container" className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-150 pb-3">
        <div className="space-y-0.5">
          <h3 className="font-display text-xl font-black text-mundial-blue flex items-center gap-2">
            <span className="p-1.5 bg-mundial-gold/20 rounded-lg text-mundial-gold-dark">
              <Trophy className="w-5 h-5 text-mundial-gold fill-mundial-gold animate-bounce" style={{ animationDuration: "3s" }} />
            </span>
            <span>Vitrina de Campeones ({achievements.filter(a => a.isUnlocked).length} / 6)</span>
          </h3>
          <p className="text-xs text-gray-500 font-medium">¡Suma cromos pegados y desbloquea los grandes hitos de la Copa Mundial!</p>
        </div>
        <span className="text-[11px] bg-mundial-grass-light text-mundial-green font-black px-3 py-1.5 rounded-full border border-mundial-grass/20 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-mundial-grass" />
          <span>Colección Oficial</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((ach) => {
          const IconComponent = ach.icon;
          const currentProgressPercent = Math.min((ach.current / ach.target) * 100, 100);

          return (
            <div
              key={ach.id}
              id={`achievement-card-${ach.id}`}
              className={`relative rounded-2xl overflow-hidden border-3 transition-all duration-300 ${
                ach.isUnlocked
                  ? "border-mundial-gold bg-gradient-to-b from-white to-mundial-light-gold/20 shadow-lg hover:shadow-2xl hover:-translate-y-1"
                  : "border-gray-200 bg-gray-50/70 opacity-90"
              }`}
            >
              {/* Gold laurels decorative background when unlocked */}
              {ach.isUnlocked && (
                <div className="absolute -right-3 -bottom-3 text-7xl opacity-5 select-none font-bold">
                  🏆
                </div>
              )}

              {/* Decorative side stadium border ribbon for unlocked badges */}
              {ach.isUnlocked ? (
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-mundial-gold via-amber-400 to-mundial-gold-dark" />
              ) : (
                <div className="absolute top-0 left-0 w-2 h-full bg-gray-300" />
              )}

              <div className="p-4.5 flex gap-3 h-full flex-col justify-between pl-6 relative">
                
                {/* Tiny badge sticker indicator */}
                <div className="absolute top-3 right-3 flex gap-1">
                  {ach.isUnlocked ? (
                    <span className="text-xs" title="¡Logrado!">⭐</span>
                  ) : (
                    <span className="text-xs opacity-40">🔒</span>
                  )}
                </div>

                <div className="flex gap-3">
                  {/* Medal Icon Badge representation */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-12.5 h-12.5 rounded-2xl flex items-center justify-center border-2.5 transition-transform ${
                        ach.isUnlocked
                          ? `bg-gradient-to-br ${ach.bgClass} text-white border-white/20 shadow-md transform rotate-3`
                          : "bg-gray-150 text-gray-400 border-gray-200"
                      }`}
                    >
                      {ach.isUnlocked ? (
                        <IconComponent className="w-6.5 h-6.5 text-white filter drop-shadow" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Visual medal ribbon tails hanging down for high achievements */}
                    {ach.isUnlocked && (
                      <div className="flex justify-center -mt-1 gap-1">
                        <div className="w-2.5 h-3 bg-mundial-red rounded-b-sm border-x border-b border-black/10" />
                        <div className="w-2.5 h-3 bg-mundial-blue rounded-b-sm border-x border-b border-black/10" />
                      </div>
                    )}
                  </div>

                  {/* Text Information */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider border ${
                        ach.isUnlocked
                          ? "bg-mundial-gold/20 text-mundial-gold-dark border-mundial-gold/30"
                          : "bg-gray-200 text-gray-500 border-gray-300"
                      }`}>
                        {ach.rarity}
                      </span>
                    </div>

                    <h4 className={`font-display text-base font-black ${
                      ach.isUnlocked ? "text-mundial-blue-dark leading-tight" : "text-gray-450 leading-tight"
                    }`}>
                      {ach.title}
                    </h4>
                    
                    <p className="text-[11px] text-gray-500 font-medium leading-normal">
                      {ach.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar info for children */}
                <div className="mt-4 pt-3 border-t border-gray-100/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-gray-500">
                    <span className="flex items-center gap-1">
                      ⚽ {ach.isUnlocked ? "¡Objetivo cumplido!" : "Camino al logro"}
                    </span>
                    <span className="font-mono text-xs text-mundial-blue font-bold">
                      {ach.current} <span className="text-[10px] text-gray-400">/ {ach.target}</span>
                    </span>
                  </div>
                  {/* Mini visual progress bar */}
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-150">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        ach.isUnlocked
                          ? "bg-gradient-to-r from-mundial-gold via-amber-400 to-mundial-gold-dark"
                          : "bg-gradient-to-r from-mundial-blue/30 to-mundial-blue/50"
                      }`}
                      style={{ width: `${currentProgressPercent}%` }}
                    />
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
