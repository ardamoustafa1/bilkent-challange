import { useEffect, useRef, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Trophy, TrendingUp, Monitor } from "lucide-react";
import { getLeagueData, formatScore } from "@/utils/scoreUtils";

export function TvModePage() {
  const { dashFiltered, apiAvailable } = useAppContext();
  const listRef = useRef<HTMLDivElement>(null);
  
  // Create league table from dashboard data
  const leagueData = getLeagueData(dashFiltered);
  
  // Auto-scroll logic
  useEffect(() => {
    const el = listRef.current;
    if (!el || leagueData.length < 9) return;

    let scrollAmount = 0;
    const speed = 0.4; // pixels per frame, slightly slower for readability

    const scrollInterval = setInterval(() => {
      if (el) {
        scrollAmount += speed;
        el.scrollTop = scrollAmount;

        // Reset if we reach the bottom
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
          setTimeout(() => {
            scrollAmount = 0;
            if (el) el.scrollTop = 0;
          }, 4000);
        }
      }
    }, 16); // ~60fps for smoother scrolling

    return () => clearInterval(scrollInterval);
  }, [leagueData]);

  // Current time
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen text-white font-sans overflow-hidden flex flex-col relative bg-[#0B1121]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/50 via-[#0B1121] to-[#040814] -z-20"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 blur-[120px] rounded-full -z-10 animate-pulse-slow"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 blur-[130px] rounded-full -z-10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-indigo-600/5 blur-[150px] rounded-full -z-10 animate-pulse-slow" style={{ animationDelay: '4s' }}></div>

      {/* Header */}
      <div className="backdrop-blur-xl bg-[#0B1121]/50 border-b border-white/5 p-8 flex items-center justify-between shadow-2xl z-10 relative">
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <Monitor className="w-14 h-14 text-cyan-400 relative z-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
            <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"></div>
          </div>
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 tracking-tight drop-shadow-sm">
              CANLI LİDERLİK TABLOSU
            </h1>
            <p className="text-cyan-400 font-semibold tracking-widest uppercase text-sm mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              AI Challenge & Innovation
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className={`px-5 py-2.5 rounded-2xl border backdrop-blur-md ${apiAvailable ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]" : "bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]"} flex items-center gap-3 font-bold uppercase tracking-wider text-sm`}>
            <span className={`w-3 h-3 rounded-full ${apiAvailable ? "bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.8)]"}`}></span>
            {apiAvailable ? "SİSTEM AKTİF" : "BAĞLANTI KOPTU"}
          </div>
          <div className="text-right backdrop-blur-md bg-white/5 border border-white/10 px-6 py-2 rounded-2xl">
            <h2 className="text-4xl font-black font-mono tracking-tight text-white drop-shadow-md">
              {time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h2>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden p-8 px-12">
        <div className="flex-1 flex flex-col overflow-hidden max-w-7xl mx-auto w-full">
          {/* Column Headers */}
          <div className="grid grid-cols-12 gap-6 pb-6 text-slate-400 font-bold uppercase tracking-widest px-8 text-sm">
            <div className="col-span-1 text-center">Sıra</div>
            <div className="col-span-4">Takım Bilgisi</div>
            <div className="col-span-3">Okul</div>
            <div className="col-span-2">Kategori</div>
            <div className="col-span-2 text-right">Performans</div>
          </div>

          {/* Scrolling List View */}
          <div ref={listRef} className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
            <div className="space-y-5 pb-32">
              {leagueData.map((item, i) => {
                const getRowStyle = () => {
                  if (i === 0) return "bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)]";
                  if (i === 1) return "bg-gradient-to-r from-slate-300/10 via-slate-300/5 to-transparent border-slate-300/30 shadow-[0_0_20px_rgba(203,213,225,0.05)]";
                  if (i === 2) return "bg-gradient-to-r from-amber-600/10 via-amber-600/5 to-transparent border-amber-600/30 shadow-[0_0_20px_rgba(217,119,6,0.05)]";
                  return "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]";
                };

                const getRankDisplay = () => {
                  if (i === 0) return <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.4)] border border-yellow-200"><Trophy className="w-8 h-8 text-yellow-950" /></div>;
                  if (i === 1) return <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 flex items-center justify-center shadow-[0_0_15px_rgba(203,213,225,0.3)] border border-slate-100"><Trophy className="w-7 h-7 text-slate-800" /></div>;
                  if (i === 2) return <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-[0_0_15px_rgba(217,119,6,0.3)] border border-amber-300"><Trophy className="w-7 h-7 text-amber-950" /></div>;
                  return <div className="w-12 h-12 rounded-full border border-slate-600/50 flex items-center justify-center text-xl font-bold text-slate-400 bg-slate-800/50">{i + 1}</div>;
                };

                const isTop3 = i < 3;

                return (
                  <div key={item.team.id} className={`grid grid-cols-12 gap-6 items-center border rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 ${getRowStyle()}`}>
                    {/* Rank */}
                    <div className="col-span-1 flex justify-center">
                      {getRankDisplay()}
                    </div>

                    {/* Team Info */}
                    <div className="col-span-4 pl-4 border-l border-white/5">
                      <h3 className={`text-3xl font-black mb-1 truncate ${i === 0 ? 'text-yellow-400 drop-shadow-md' : 'text-white'}`}>
                        {item.team.name}
                      </h3>
                      <p className="text-slate-400 truncate text-lg font-medium">
                        {item.team.projectTitle || "Proje Belirtilmedi"}
                      </p>
                    </div>

                    {/* School Info */}
                    <div className="col-span-3 flex flex-col justify-center">
                       <span className="text-slate-200 text-xl font-semibold truncate">{item.team.school}</span>
                    </div>

                    {/* Category */}
                    <div className="col-span-2 flex flex-col justify-center items-start gap-2">
                       <span className="bg-white/10 border border-white/5 text-slate-300 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                         Hafta {item.team.week}
                       </span>
                       <span className="text-slate-400 text-sm truncate">{item.team.tournamentCategory}</span>
                    </div>

                    {/* Final Score */}
                    <div className="col-span-2 text-right flex flex-col items-end justify-center">
                      {item.hasScores ? (
                        <>
                          <div className={`text-5xl font-black font-mono tracking-tighter ${
                            i === 0 ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 
                            i === 1 ? 'text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-400 drop-shadow-[0_0_10px_rgba(203,213,225,0.4)]' :
                            i === 2 ? 'text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.4)]' :
                            'text-cyan-400'
                          }`}>
                            {formatScore(item.totalScore)}
                          </div>
                          {isTop3 && (
                            <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mt-2 ${
                              i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : 'text-amber-500'
                            }`}>
                               <TrendingUp className="w-4 h-4" />
                               Liderlik Grubunda
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-slate-600 font-mono">-</span>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {leagueData.length === 0 && (
                <div className="flex flex-col items-center justify-center p-32 text-slate-500 border-2 border-dashed border-slate-800/50 rounded-3xl backdrop-blur-sm bg-black/20">
                  <Monitor className="w-24 h-24 mb-6 text-slate-600 drop-shadow-md" />
                  <p className="text-3xl font-bold tracking-tight text-slate-400">Puanlama henüz başlamadı</p>
                  <p className="text-lg text-slate-500 mt-2">İlk sonuçlar geldiğinde tablo otomatik olarak güncellenecektir.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px; /* Hide scrollbar for a cleaner TV look */
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
