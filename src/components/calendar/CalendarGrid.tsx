'use client';

import { DayData } from '@/types';
import DayCell from './DayCell';

interface CalendarGridProps {
  days: DayData[];
  onDayClick: (day: DayData) => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_COLORS = [
  'text-red-400',
  'text-gray-400',
  'text-gray-400',
  'text-gray-400',
  'text-gray-400',
  'text-gray-400',
  'text-blue-400',
];

export default function CalendarGrid({ days, onDayClick }: CalendarGridProps) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="w-full">
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-0.5 mb-1.5">
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={`text-center text-[11px] font-semibold ${DAY_COLORS[i]} py-1`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 bg-slate-800/50 rounded-xl p-1 border border-slate-700/50">
        {days.map((day) => (
          <DayCell key={day.id} day={day} onClick={() => onDayClick(day)} isToday={day.id === todayStr} />
        ))}
      </div>
    </div>
  );
}
