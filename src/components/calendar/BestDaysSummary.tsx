'use client';

import { DayData } from '@/types';

interface BestDaysSummaryProps {
  days: DayData[];
  onDayClick: (day: DayData) => void;
}

function getDayScore(day: DayData): number {
  if (day.visibility === 'hidden') return 0;
  let score = 100;
  score -= (day.moonLevel - 1) * 8;
  if (day.cloudCoverPercentage !== null) score -= day.cloudCoverPercentage * 0.5;
  // Bonus for dark sky (low light pollution)
  if (day.lightPollution) {
    score -= (day.lightPollution.bortleScale - 1) * 3;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

export default function BestDaysSummary({ days, onDayClick }: BestDaysSummaryProps) {
  const ranked = days
    .filter((d) => d.visibility === 'visible')
    .map((d) => ({ ...d, score: getDayScore(d) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (ranked.length === 0) return null;

  return (
    <div className="w-full mt-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        🏆 Best Shooting Days
      </h3>
      <div className="space-y-1.5">
        {ranked.map((day, i) => {
          const scoreColor =
            day.score >= 80 ? 'text-green-400' :
            day.score >= 60 ? 'text-emerald-400' :
            day.score >= 40 ? 'text-yellow-400' : 'text-orange-400';

          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;

          return (
            <button
              key={day.id}
              onClick={() => onDayClick(day)}
              className="w-full flex items-center justify-between bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700/30 rounded-lg px-3 py-2 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{medal}</span>
                <span className="text-xs text-slate-300">{day.id}</span>
                {day.galacticCenter && (
                  <span className="text-[10px] text-slate-500">
                    {day.galacticCenter.rise}–{day.galacticCenter.set}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">🌙{day.moonPercentage}%</span>
                <span className={`text-sm font-bold ${scoreColor}`}>{day.score}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
