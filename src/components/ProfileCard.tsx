import React, { useState } from "react";
import { Profile } from "../types";
import { User, Shield, Trophy, Settings } from "lucide-react";
import { motion } from "motion/react";

interface ProfileCardProps {
  profile: Profile;
  onUpdate: (profile: Profile) => void;
}

const AVATARS = ["⚽", "🏆", "🦁", "🦖", "🦅", "🌟", "🦄", "⚡", "🐻", "🍕"];
const TEAMS = [
  { name: "Mundial Celeste", color: "from-sky-400 to-blue-600", text: "text-sky-100" },
  { name: "Verde Césped", color: "from-green-500 to-emerald-700", text: "text-green-100" },
  { name: "Furia Roja", color: "from-red-500 to-rose-700", text: "text-red-100" },
  { name: "Canarinha", color: "from-yellow-400 to-yellow-600", text: "text-amber-950" },
  { name: "Tricolor", color: "from-green-600 via-white to-red-600", text: "text-slate-900" },
  { name: "Escuadra Dorada", color: "from-amber-400 to-yellow-600", text: "text-amber-950" },
];

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempAvatar, setTempAvatar] = useState(profile.avatar);
  const [tempTeam, setTempTeam] = useState(profile.favoriteTeam);

  const handleSave = () => {
    onUpdate({
      name: tempName.trim() || "Coleccionista",
      avatar: tempAvatar,
      favoriteTeam: tempTeam,
    });
    setIsEditing(false);
  };

  const activeTeamStyle = TEAMS.find((t) => t.name === profile.favoriteTeam) || TEAMS[0];

  return (
    <div id="profile-container" className="bg-white rounded-2xl shadow-xl border-3 border-mundial-blue overflow-hidden relative">
      {/* Dynamic Header color depending on user's favorite team, looks like a soccer card header */}
      <div className={`bg-gradient-to-r ${activeTeamStyle.color} p-5 transition-all duration-300 relative`}>
        {/* Background visual card overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/15" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <span className="text-5xl filter drop-shadow animate-bounce block select-none" style={{ animationDuration: '3s' }}>
                {profile.avatar}
              </span>
              <span className="absolute -bottom-1 -right-1 text-xs bg-mundial-gold text-mundial-blue-dark font-black px-1 rounded border border-white">
                PRO
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-90 text-white/90 drop-shadow flex items-center gap-1">
                <span>⭐ Coleccionista Oficial</span>
                <span className="text-mundial-gold">⭐⭐</span>
              </p>
              <h2 className={`font-display text-2xl font-black tracking-tight drop-shadow-md ${activeTeamStyle.text}`}>
                {profile.name}
              </h2>
            </div>
          </div>
          <button
            id="edit-profile-btn"
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white/25 hover:bg-white/35 active:scale-95 text-white p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black uppercase shadow-sm border border-white/20"
          >
            <Settings className="w-4 h-4" />
            <span>{isEditing ? "Cerrar" : "Personalizar"}</span>
          </button>
        </div>
      </div>

      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-4 border-t-3 border-mundial-blue bg-mundial-grass-light/40 space-y-4"
        >
          <div className="space-y-1">
            <label className="block text-xs font-bold text-mundial-blue uppercase tracking-wider">
              ¡Escribe tu nombre de Coleccionista!
            </label>
            <input
              id="profile-name-input"
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value.slice(0, 18))}
              placeholder="Ej. Juanito & Papá"
              className="w-full px-3 py-2 border-2 border-mundial-blue rounded-xl bg-white text-mundial-blue font-bold focus:outline-none focus:ring-2 focus:ring-mundial-gold"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-mundial-blue uppercase tracking-wider">
              Selecciona tu Avatar 🏆
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  id={`avatar-btn-${emoji}`}
                  type="button"
                  onClick={() => setTempAvatar(emoji)}
                  className={`text-2xl p-2 rounded-xl transition-all duration-150 cursor-pointer ${
                    tempAvatar === emoji
                      ? "bg-mundial-gold border-2 border-mundial-blue scale-110 shadow-sm"
                      : "bg-white hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-mundial-blue uppercase tracking-wider">
              Esquema de Colores del Club
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TEAMS.map((team) => (
                <button
                  key={team.name}
                  id={`team-theme-btn-${team.name.replace(/\s+/g, '')}`}
                  type="button"
                  onClick={() => setTempTeam(team.name)}
                  className={`text-xs font-bold p-2.5 rounded-xl text-left flex items-center justify-between transition-all capitalize border-2 cursor-pointer ${
                    tempTeam === team.name
                      ? "border-mundial-blue bg-white shadow-sm font-black"
                      : "border-gray-200 bg-white/70 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${team.color} border border-black/10`} />
                    {team.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              id="save-profile-btn"
              onClick={handleSave}
              className="bg-mundial-blue hover:bg-mundial-blue-dark active:scale-95 text-white font-black text-sm uppercase px-5 py-2.5 rounded-xl cursor-pointer shadow-sm transition-all text-center flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-mundial-gold" />
              <span>Guardar Mi Ficha</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
