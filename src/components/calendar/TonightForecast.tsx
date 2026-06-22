'use client';

import { DayData } from '@/types';

interface TonightForecastProps {
  today: DayData | null | undefined;
  tomorrow: DayData | null | undefined;
  onDayClick: (day: DayData) => void;
}

function getScoreEmoji(score: number): string {
  if (score >= 80) return '🤩';
  if (score >= 60) return '😊';
  if (score >= 40) return '😐';
  if (score >= 20) return '😕';
  return '😴';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Poor';
  return 'Bad';
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-emerald-400';
  if (score >= 40) return 'text-yellow-400';
  if (score >= 20) return 'text-orange-400';
  return 'text-red-400';
}

function calcScore(day: DayData): number {
  if (day.visibility === 'hidden') return 0;
  let score = 100;
  score -= (day.moonLevel - 1) * 8;
  if (day.cloudCoverPercentage !== null) score -= day.cloudCoverPercentage * 0.5;
  if (!day.galacticCenter) score -= 30; // GC not visible during night
  return Math.max(0, Math.min(100, Math.round(score)));
}

function MoonPhaseEmoji(level: number): string {
  if (level <= 1) return '🌑';
  if (level <= 3) return '🌒';
  if (level <= 5) return '🌓';
  if (level <= 7) return '🌔';
  return '🌕';
}

export default function TonightForecast({ today, tomorrow, onDayClick }: TonightForecastProps) {
  if (!today) return null;

  const todayDay = today!;
  const todayScore = calcScore(todayDay);
  const tomorrowScore = tomorrow ? calcScore(tomorrow) : null;
  const now = new Date();
  const hour = now.getHours();
  const isNight = hour >= 19 || hour <= 5;

  return (
    <div className="mb-4">
      {/* Tonight's Forecast Card */}
      <div
        className={`rounded-2xl p-4 border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
          isNight
            ? 'bg-gradient-to-br from-indigo-900/60 to-purple-900/40 border-indigo-500/30 shadow-lg shadow-indigo-500/10'
            : 'bg-gradient-to-br from-slate-800/80 to-slate-900/60 border-slate-700/50'
        }`}
        onClick={() => onDayClick(today)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{isNight ? '🌙' : '📅'}</span>
            <span className="text-sm font-semibold text-white">
              {isNight ? "Tonight's Forecast" : "Today's Forecast"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl">{getScoreEmoji(todayScore)}</span>
            <span className={`text-sm font-bold ${getScoreColor(todayScore)}`}>
              {getScoreLabel(todayScore)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          {/* Moon */}
          <div className="text-center">
            <div className="text-2xl mb-0.5">{MoonPhaseEmoji(today.moonLevel)}</div>
            <div className="text-[10px] text-slate-400">Moon {today.moonPercentage}%</div>
          </div>

          {/* GC Window */}
          <div className="text-center">
            <div className="text-lg mb-0.5">🌌</div>
            {today.galacticCenter ? (
              <div className="text-[10px] text-slate-400">
                {today.galacticCenter.rise} – {today.galacticCenter.set}
              </div>
            ) : (
              <div className="text-[10px] text-slate-600">Not visible</div>
            )}
          </div>

          {/* Cloud */}
          <div className="text-center">
            <div className="text-lg mb-0.5">
              {today.cloudCoverPercentage === null ? '❓' : today.cloudCoverPercentage < 30 ? '☀️' : today.cloudCoverPercentage < 60 ? '⛅' : '☁️'}
            </div>
            <div className="text-[10px] text-slate-400">
              {today.cloudCoverPercentage !== null ? `${today.cloudCoverPercentage}% clouds` : 'No data'}
            </div>
          </div>
        </div>

        {/* Score bar */}
        <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              todayScore >= 80 ? 'bg-green-400' :
              todayScore >= 60 ? 'bg-emerald-400' :
              todayScore >= 40 ? 'bg-yellow-400' :
              todayScore >= 20 ? 'bg-orange-400' : 'bg-red-400'
            }`}
            style={{ width: `${todayScore}%` }}
          />
        </div>

        {/* Quick tip */}
        <p className="text-[10px] text-slate-500 text-center">
          {todayScore >= 80 ? '🌟 Perfect night! Get your gear ready!' :
           todayScore >= 60 ? '👍 Good conditions. Worth going out!' :
           todayScore >= 40 ? '😐 Decent, but not ideal.' :
           todayScore >= 20 ? '⚠️ Challenging conditions.' :
           '😴 Better stay home tonight.'}
        </p>
      </div>

      {/* Tomorrow preview (smaller) */}
      {tomorrow && (
        <div
          className="mt-2 rounded-xl bg-slate-800/40 border border-slate-700/30 p-3 cursor-pointer hover:bg-slate-800/60 transition-all"
          onClick={() => onDayClick(tomorrow)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Tomorrow</span>
              <span className="text-sm">{MoonPhaseEmoji(tomorrow.moonLevel)}</span>
              {tomorrow.galacticCenter && <span className="text-xs">🌌</span>}
            </div>
            <div className="flex items-center gap-2">
              {tomorrow.cloudCoverPercentage !== null && (
                <span className="text-[10px] text-slate-500">☁ {tomorrow.cloudCoverPercentage}%</span>
              )}
              <span className={`text-xs font-semibold ${getScoreColor(tomorrowScore!)}`}>
                {getScoreEmoji(tomorrowScore!)} {getScoreLabel(tomorrowScore!)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
