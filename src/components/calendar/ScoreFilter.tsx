'use client';

export type ScoreMode = 'balanced' | 'moon' | 'cloud' | 'gc';

interface ScoreFilterProps {
  mode: ScoreMode;
  onChange: (mode: ScoreMode) => void;
}

const MODES: { key: ScoreMode; label: string; icon: string; desc: string }[] = [
  { key: 'balanced', label: 'Balanced', icon: '⚖️', desc: 'All factors equal' },
  { key: 'moon', label: 'Moon', icon: '🌙', desc: 'Prioritize dark skies' },
  { key: 'cloud', label: 'Cloud', icon: '☁️', desc: 'Prioritize clear skies' },
  { key: 'gc', label: 'GC', icon: '🌌', desc: 'Prioritize GC visibility' },
];

export default function ScoreFilter({ mode, onChange }: ScoreFilterProps) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[10px] text-slate-500 uppercase tracking-wide">Score Filter</span>
      </div>
      <div className="flex gap-1.5">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => onChange(m.key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-center transition-all ${
              mode === m.key
                ? 'bg-indigo-600/80 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300'
            }`}
            title={m.desc}
          >
            <span className="text-sm">{m.icon}</span>
            <span className="text-[9px] font-medium">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function calcWeightedScore(day: import('@/types').DayData, mode: ScoreMode): number {
  if (day.visibility === 'hidden' && mode !== 'cloud') return 0;

  let score = 100;

  switch (mode) {
    case 'moon':
      // Moon is most important (dark sky), then cloud, then GC
      score -= (day.moonLevel - 1) * 12;
      if (day.cloudCoverPercentage !== null) score -= day.cloudCoverPercentage * 0.3;
      if (!day.galacticCenter) score -= 10;
      break;

    case 'cloud':
      // Cloud is most important (clear sky), then moon, then GC
      if (day.cloudCoverPercentage !== null) score -= day.cloudCoverPercentage * 0.8;
      else score -= 20; // Penalty for unknown cloud data
      score -= (day.moonLevel - 1) * 5;
      if (!day.galacticCenter) score -= 10;
      break;

    case 'gc':
      // GC visibility is most important
      if (!day.galacticCenter) score -= 50;
      score -= (day.moonLevel - 1) * 6;
      if (day.cloudCoverPercentage !== null) score -= day.cloudCoverPercentage * 0.4;
      break;

    case 'balanced':
    default:
      score -= (day.moonLevel - 1) * 8;
      if (day.cloudCoverPercentage !== null) score -= day.cloudCoverPercentage * 0.5;
      if (!day.galacticCenter) score -= 20;
      break;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
