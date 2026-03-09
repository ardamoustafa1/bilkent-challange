import React from 'react';
import { Trophy, Award, BrainCircuit, Activity, GraduationCap } from 'lucide-react';
import type { Team } from '@/types';
import { evolPercent, computeSubScores, formatScore } from '@/utils/scoreUtils';

interface ReportCardProps {
  team: Team;
}

export const ReportCard = React.forwardRef<HTMLDivElement, ReportCardProps>(({ team }, ref) => {
  const finalScore = evolPercent(team.scores);
  const subScores = computeSubScores(team.scores);
  
  // Format dates and info
  const dateStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const isEvaluated = finalScore > 0;

  return (
    <div 
      ref={ref} 
      // A4 dimensions at 96 DPI: 794px x 1123px (We use a multiple for higher quality)
      className="bg-white text-slate-800 absolute top-[-9999px] left-[-9999px]"
      style={{
        width: '1190px', // A4 width scaled (150 DPI roughly)
        height: '1684px', // A4 height scaled
        padding: '60px',
        boxSizing: 'border-box',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Background Decals */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-50 rounded-bl-[100%] -z-10 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50 rounded-tr-[100%] -z-10 opacity-60"></div>
      
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 mb-2">Performans Karnesi</h1>
          <p className="text-xl text-slate-500 font-medium">BİLTEK AI Challenge & Innovation</p>
        </div>
        <div className="text-right">
          <div className="text-5xl opacity-20 mb-2">
             <BrainCircuit />
          </div>
          <p className="text-lg font-semibold text-slate-600">{dateStr}</p>
        </div>
      </div>

      {/* Team Info Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-10 mb-12 flex items-center justify-between shadow-sm">
        <div className="max-w-[60%]">
          <h2 className="text-6xl font-black text-slate-900 mb-3 uppercase tracking-tight">{team.name}</h2>
          <p className="text-2xl text-cyan-700 font-bold mb-6">{team.projectTitle || "Proje Adı Belirtilmedi"}</p>
          
          <div className="flex gap-6 text-slate-600">
            <div className="flex items-center gap-2 text-xl bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
               <GraduationCap className="w-6 h-6 text-indigo-500" />
               <span className="font-semibold">{team.school}</span>
            </div>
            <div className="flex items-center gap-2 text-xl bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
               <Activity className="w-6 h-6 text-emerald-500" />
               <span className="font-semibold">{team.tournamentCategory} (Hafta {team.week})</span>
            </div>
          </div>
        </div>

        {/* Final Score Circle */}
        <div className="relative">
          <div className="w-64 h-64 rounded-full border-8 border-slate-100 flex items-center justify-center bg-white shadow-xl relative z-10">
            <div className="text-center">
               <p className="text-lg text-slate-400 font-bold uppercase tracking-widest mb-1">Genel Skor</p>
               {isEvaluated ? (
                 <p className="text-7xl font-black text-slate-900 tracking-tighter">{formatScore(finalScore)}</p>
               ) : (
                 <p className="text-6xl font-black text-slate-300">-</p>
               )}
            </div>
          </div>
          {isEvaluated && finalScore >= 80 && (
             <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4 border-white z-20">
               <Trophy className="w-10 h-10" />
             </div>
          )}
        </div>
      </div>

      {/* Detail Sections */}
      <div className="grid grid-cols-2 gap-10">
        {/* Left Col */}
        <div className="space-y-10">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Dijital Dönüşüm</h3>
                <span className="text-3xl font-black text-cyan-600">{isEvaluated ? subScores.digital.toFixed(1) : '-'} <span className="text-lg text-slate-400">/ 5.0</span></span>
             </div>
             <p className="text-slate-500 text-lg leading-relaxed">
               Yapay zeka mantığı, prompt mühendisliği, model entegrasyonu ve analitik düşünce becerilerini kapsar. 
               (AI Logic x3 ve Prompt x2 ile ağırlıklandırılmıştır).
             </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Temel Beceriler</h3>
                <span className="text-3xl font-black text-indigo-600">{isEvaluated ? subScores.skill.toFixed(1) : '-'} <span className="text-lg text-slate-400">/ 5.0</span></span>
             </div>
             <p className="text-slate-500 text-lg leading-relaxed">
               Takım uyumu, liderlik, eleştirel düşünme, iletişim ve geri bildirime açıklık metriklerini yansıtır.
             </p>
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-10">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Etki ve Fizibilite</h3>
                <span className="text-3xl font-black text-emerald-600">{isEvaluated ? subScores.project.toFixed(1) : '-'} <span className="text-lg text-slate-400">/ 5.0</span></span>
             </div>
             <p className="text-slate-500 text-lg leading-relaxed">
               Projenin gerçek hayat senaryosunda uygulanabilirliği, MVP bütünlüğü ve ölçeklenebilirliği gibi iş modeli unsurlarıdır.
             </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Sunum Yeteneği</h3>
                <span className="text-3xl font-black text-amber-600">{isEvaluated ? subScores.presentation.toFixed(1) : '-'} <span className="text-lg text-slate-400">/ 5.0</span></span>
             </div>
             <p className="text-slate-500 text-lg leading-relaxed">
               Sahnede projeyi pazarlama, ikna edicilik, zaman yönetimi ve jüri sorularına (Soru-Cevap) verilen cevapların kalitesidir.
             </p>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="absolute bottom-16 left-16 right-16">
        <div className="border-t-2 border-slate-100 pt-8 flex justify-between items-end">
           <div className="max-w-[70%]">
             <h4 className="text-xl font-bold text-slate-800 mb-2">Jüri Değerlendirme Notu</h4>
             {team.judgeNote ? (
               <p className="text-lg text-slate-600 italic bg-slate-50 p-4 rounded-2xl border border-slate-100">"{team.judgeNote}"</p>
             ) : (
               <p className="text-lg text-slate-400 italic">Genel değerlendirme notu eklenmemiştir.</p>
             )}
           </div>
           <div className="text-right">
              <Award className="w-16 h-16 text-slate-200 inline-block mb-2" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Resmi Sonuç Belgesi</p>
              <p className="text-xs text-slate-400 mt-1">Sistem tarafından otomatik üretilmiştir.</p>
           </div>
        </div>
      </div>

    </div>
  );
});

ReportCard.displayName = 'ReportCard';
