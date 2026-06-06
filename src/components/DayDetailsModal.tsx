'use client';

import { DayData } from '@/types';

interface DayDetailsModalProps {
  day: DayData;
  onClose: () => void;
}

const MOON_LABEL: Record<number, string> = {
  1:  'New Moon — Very Dark (Best)',
  2:  'Waxing Crescent — Dark',
  3:  'Waxing Crescent — Slightly Dark',
  4:  'First Quarter — Moderate',
  5:  'Waxing Gibbous — Half Moon',
  6:  'Waxing Gibbous — Bright',
  7:  'Waning Gibbous — Very Bright',
  8:  'Last Quarter — Extremely Bright',
  9:  'Waning Crescent — Nearly Full',
  10: 'Full Moon — Full Moon (Worst)',
};

const MOON_EMOJI: Record<number, string> = {
  1: '🌑', 2: '🌒', 3: '🌒', 4: '🌓', 5: '🌔',
  6: '🌔', 7: '🌕', 8: '🌖', 9: '🌗', 10: '🌕',
};

function getShootingAdvice(day: DayData): string[] {
  const tips: string[] = [];

  if (day.visibility === 'hidden') {
    tips.push('🚫 Galactic Center is not visible on this date.');
    return tips;
  }

  if (day.moonLevel <= 2) {
    tips.push('🌙 Excellent moon conditions — very dark sky!');
  } else if (day.moonLevel <= 4) {
    tips.push('🌙 Good moon conditions — manageable light pollution from moon.');
  } else if (day.moonLevel <= 6) {
    tips.push('🌙 Moderate moonlight — consider shooting after moonset.');
  } else {
    tips.push('🌕 Bright moon — Milky Way core will be washed out.');
  }

  if (day.cloudCoverPercentage < 20) {
    tips.push('☀️ Clear skies expected — great for shooting!');
  } else if (day.cloudCoverPercentage < 50) {
    tips.push('⛅ Partly cloudy — some clear patches possible.');
  } else {
    tips.push('☁️ Mostly cloudy — Milky Way may be obscured.');
  }

  if (day.galacticCenter) {
    tips.push(`🌌 GC visible from ${day.galacticCenter.rise} to ${day.galacticCenter.set}`);
  }

  return tips;
}

function getOverallScore(day: DayData): { score: number; label: string; color: string } {
  if (day.visibility === 'hidden') return { score: 0, label: 'Not Visible', color: 'text-gray-400' };

  let score = 100;
  score -= (day.moonLevel - 1) * 8;
  score -= day.cloudCoverPercentage * 0.5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  if (score >= 80) return { score, label: 'Excellent', color: 'text-green-400' };
  if (score >= 60) return { score, label: 'Good', color: 'text-emerald-400' };
  if (score >= 40) return { score, label: 'Fair', color: 'text-yellow-400' };
  if (score >= 20) return { score, label: 'Poor', color: 'text-orange-400' };
  return { score, label: 'Very Poor', color: 'text-red-400' };
}

export default function DayDetailsModal({ day, onClose }: DayDetailsModalProps) {
  const score = getOverallScore(day);
  const advice = getShootingAdvice(day);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-700/50 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xl font-bold text-white">{day.id}</h2>
            {day.isHoliday && (
              <span className="text-xs text-red-400 font-medium">🎉 Holiday</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 text-gray-300 text-lg transition-colors"
          >
            ×
          </button>
        </div>

        {day.visibility === 'hidden' ? (
          <div className="text-center py-8">
            <span className="text-4xl block mb-3">🌑</span>
            <p className="text-gray-400 text-sm">
              Milky Way Galactic Center is not visible on this date.
            </p>
          </div>
        ) : (
          <>
            {/* Score card */}
            <div className="bg-slate-700/40 rounded-xl p-4 mb-5 text-center">
              <div className={`text-4xl font-black ${score.color}`}>{score.score}</div>
              <div className={`text-sm font-semibold ${score.color}`}>{score.label}</div>
              <div className="text-[10px] text-gray-500 mt-1">Shooting Score</div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* Moon */}
              <div className="bg-slate-700/30 rounded-lg p-3">
                <div className="text-2xl mb-1">{MOON_EMOJI[day.moonLevel]}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Moon</div>
                <div className="text-xs text-gray-200 font-medium">{MOON_LABEL[day.moonLevel]}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Illumination: {day.moonPercentage}%</div>
              </div>

              {/* Cloud */}
              <div className="bg-slate-700/30 rounded-lg p-3">
                <div className="text-2xl mb-1">{day.cloudCoverPercentage < 30 ? '☀️' : day.cloudCoverPercentage < 60 ? '⛅' : '☁️'}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Cloud Cover</div>
                <div className="text-xs text-gray-200 font-medium">{day.cloudCoverPercentage}%</div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {day.cloudCoverPercentage < 30 ? 'Clear' : day.cloudCoverPercentage < 60 ? 'Partly Cloudy' : 'Mostly Cloudy'}
                  {day.cloudSource === 'api' && <span className="text-emerald-400 ml-1">● Live</span>}
                </div>
              </div>

              {/* GC Rise */}
              {day.galacticCenter && (
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="text-2xl mb-1">🌅</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">GC Rise</div>
                  <div className="text-lg text-emerald-400 font-bold">{day.galacticCenter.rise}</div>
                </div>
              )}

              {/* GC Set */}
              {day.galacticCenter && (
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="text-2xl mb-1">🌇</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">GC Set</div>
                  <div className="text-lg text-rose-400 font-bold">{day.galacticCenter.set}</div>
                </div>
              )}
            </div>

            {/* Sun & Moon Times */}
            {day.sunMoon && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                  🌞 Sun & Moon Times
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {/* Sunrise */}
                  <div className="bg-amber-900/20 border border-amber-700/20 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="text-lg">🌅</span>
                    <div>
                      <div className="text-[9px] text-amber-400/70 uppercase">Sunrise</div>
                      <div className="text-sm text-amber-300 font-semibold">{day.sunMoon.sunrise}</div>
                    </div>
                  </div>
                  {/* Sunset */}
                  <div className="bg-orange-900/20 border border-orange-700/20 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="text-lg">🌇</span>
                    <div>
                      <div className="text-[9px] text-orange-400/70 uppercase">Sunset</div>
                      <div className="text-sm text-orange-300 font-semibold">{day.sunMoon.sunset}</div>
                    </div>
                  </div>
                  {/* Golden Hour */}
                  <div className="bg-yellow-900/20 border border-yellow-700/20 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    <div>
                      <div className="text-[9px] text-yellow-400/70 uppercase">Golden Hour</div>
                      <div className="text-xs text-yellow-300 font-medium">
                        {day.sunMoon.sunset} → {day.sunMoon.goldenHourEnd}
                      </div>
                    </div>
                  </div>
                  {/* Blue Hour */}
                  <div className="bg-blue-900/20 border border-blue-700/20 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="text-lg">🔵</span>
                    <div>
                      <div className="text-[9px] text-blue-400/70 uppercase">Blue Hour</div>
                      <div className="text-xs text-blue-300 font-medium">
                        {day.sunMoon.goldenHourEnd} → {day.sunMoon.nauticalDusk}
                      </div>
                    </div>
                  </div>
                  {/* Moonrise */}
                  {day.sunMoon.moonrise && (
                    <div className="bg-slate-700/20 border border-slate-600/20 rounded-lg px-3 py-2 flex items-center gap-2">
                      <span className="text-lg">🌕</span>
                      <div>
                        <div className="text-[9px] text-slate-400/70 uppercase">Moonrise</div>
                        <div className="text-sm text-slate-200 font-semibold">{day.sunMoon.moonrise}</div>
                      </div>
                    </div>
                  )}
                  {/* Moonset */}
                  {day.sunMoon.moonset && (
                    <div className="bg-slate-700/20 border border-slate-600/20 rounded-lg px-3 py-2 flex items-center gap-2">
                      <span className="text-lg">🌑</span>
                      <div>
                        <div className="text-[9px] text-slate-400/70 uppercase">Moonset</div>
                        <div className="text-sm text-slate-200 font-semibold">{day.sunMoon.moonset}</div>
                      </div>
                    </div>
                  )}
                  {/* Night Start (Astronomical) */}
                  <div className="col-span-2 bg-indigo-900/20 border border-indigo-700/20 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="text-lg">🌌</span>
                    <div>
                      <div className="text-[9px] text-indigo-400/70 uppercase">Astronomical Night (best for MW)</div>
                      <div className="text-sm text-indigo-300 font-semibold">{day.sunMoon.nightStart} → {day.sunMoon.sunrise}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shooting advice */}
            <div className="bg-indigo-900/30 border border-indigo-700/30 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-indigo-300 mb-2">📸 Shooting Advice</h3>
              <ul className="space-y-1.5">
                {advice.map((tip, i) => (
                  <li key={i} className="text-xs text-gray-300 leading-relaxed">{tip}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
