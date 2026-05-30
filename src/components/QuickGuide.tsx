import React from "react";
import { Printer, Scissors, Flame, CheckCircle2, Award } from "lucide-react";

export const QuickGuide: React.FC = () => {
  const steps = [
    {
      num: "1",
      title: "Imprime",
      desc: "Imprime tu álbum o los folios de cromos oficiales en papel adhesivo.",
      icon: Printer,
      color: "bg-blue-100 text-blue-600 border-blue-200",
      accent: "text-blue-500",
    },
    {
      num: "2",
      title: "Recorta",
      desc: "Recorta cada cromo por la línea punteada usando tijeras con cuidado.",
      icon: Scissors,
      color: "bg-rose-100 text-rose-600 border-rose-200",
      accent: "text-rose-500",
    },
    {
      num: "3",
      title: "Pega",
      desc: "Busca la casilla correcta del país y pégalo bien centrado.",
      icon: Award,
      color: "bg-amber-100 text-amber-600 border-amber-200",
      accent: "text-amber-500",
    },
    {
      num: "4",
      title: "Marca tu avance",
      desc: "¡Suma +1 aquí! Verás crecer tu barra de progreso y ganarás logros especiales.",
      icon: CheckCircle2,
      color: "bg-emerald-100 text-emerald-600 border-emerald-200",
      accent: "text-emerald-500",
    },
  ];

  return (
    <div id="quick-guide-container" className="bg-gradient-to-br from-mundial-blue-dark to-mundial-blue text-white rounded-2xl p-5 shadow-lg border-2 border-mundial-gold relative overflow-hidden">
      {/* Absolute Grass corner background effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-mundial-grass/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-mundial-red/10 rounded-full blur-2xl pointer-events-none" />

      <h3 className="font-display text-xl font-extrabold text-mundial-gold mb-4 flex items-center gap-2">
        <Flame className="w-5 h-5 text-mundial-red fill-mundial-red animate-pulse" />
        <span>Guía de Campeones: ¿Cómo se Llena?</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => {
          const StepIcon = step.icon;
          return (
            <div
              key={step.num}
              id={`guide-step-${step.num}`}
              className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3.5 flex flex-col justify-between transition-all hover:border-white/25 hover:bg-white/15 hover:translate-y-[-2px] group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-mundial-gold text-mundial-blue-dark font-black tracking-tight text-sm">
                    {step.num}
                  </span>
                  <div className={`p-1.5 rounded-lg border ${step.color} group-hover:scale-110 transition-transform`}>
                    <StepIcon className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="font-display font-bold text-base text-white group-hover:text-mundial-gold transition-colors">
                  {step.title}
                </h4>
                <p className="text-xs text-white/80 leading-relaxed mt-1">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
