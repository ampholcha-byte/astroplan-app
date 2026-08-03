'use client';

import { useState, useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import type { DayChecklist, ChecklistItem } from '@/types';
import {
  getChecklist,
  createChecklist,
  updateChecklist,
  toggleItem,
  addItem,
  removeItem,
} from '@/lib/checklist';

interface ChecklistPanelProps {
  dateId: string;
  location: string;
}

const CHECKLIST_EVENT = 'astroplan-checklist-change';

function readChecklist(dateId: string, location: string): DayChecklist {
  let cl = getChecklist(dateId);
  if (!cl) cl = createChecklist(dateId, location);
  return cl;
}

export default function ChecklistPanel({ dateId, location }: ChecklistPanelProps) {
  const [newItemText, setNewItemText] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);

  // Track current props in a ref, updated in an effect (not during render).
  const ref = useRef({ dateId, location });
  useEffect(() => {
    ref.current = { dateId, location };
  }, [dateId, location]);

  // useSyncExternalStore avoids the "set-state-in-effect" warning and keeps
  // client-only localStorage state correct.
  const subscribe = useCallback(() => {
    const handler = () => {};
    window.addEventListener(CHECKLIST_EVENT, handler);
    return () => window.removeEventListener(CHECKLIST_EVENT, handler);
  }, []);

  const getSnapshot = useCallback(() => {
    const { dateId: d, location: l } = ref.current;
    return readChecklist(d, l);
  }, []);

  const checklist = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => readChecklist(dateId, location)
  );

  const refresh = useCallback(() => {
    window.dispatchEvent(new Event(CHECKLIST_EVENT));
  }, []);

  const handleToggle = (itemId: string) => {
    toggleItem(dateId, itemId);
    refresh();
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    addItem(dateId, newItemText.trim());
    setNewItemText('');
    refresh();
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(dateId, itemId);
    refresh();
  };

  const handleNotesChange = (notes: string) => {
    updateChecklist(dateId, { notes });
    refresh();
  };

  const checkedCount = checklist.items.filter((i: ChecklistItem) => i.checked).length;
  const totalCount = checklist.items.length;
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return (
    <div className="mt-5 border-t border-slate-700/50 pt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-indigo-300">📋 Shooting Checklist</h3>
        <span className="text-[10px] text-slate-500">{checkedCount}/{totalCount} done</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-700 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-1.5 mb-4">
        {checklist.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 group"
          >
            <button
              onClick={() => handleToggle(item.id)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                item.checked
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-600 hover:border-slate-400'
              }`}
            >
              {item.checked && <span className="text-xs">✓</span>}
            </button>
            <span className={`text-xs flex-1 ${item.checked ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
              {item.text}
            </span>
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="text-slate-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Add new item */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
          placeholder="Add item..."
          className="flex-1 px-3 py-1.5 text-xs border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          onClick={handleAddItem}
          disabled={!newItemText.trim()}
          className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          +
        </button>
      </div>

      {/* Notes */}
      <div>
        <button
          onClick={() => setEditingNotes(!editingNotes)}
          className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors mb-1"
        >
          {editingNotes ? '▼ Hide notes' : '▶ Add notes...'}
        </button>
        {editingNotes && (
          <textarea
            value={checklist.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Location notes, equipment settings, etc."
            rows={3}
            className="w-full px-3 py-2 text-xs border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
        )}
        {!editingNotes && checklist.notes && (
          <p className="text-[10px] text-slate-400 mt-1 whitespace-pre-wrap">{checklist.notes}</p>
        )}
      </div>
    </div>
  );
}
