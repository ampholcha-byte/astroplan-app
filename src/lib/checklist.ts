export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface DayChecklist {
  dateId: string;       // YYYY-MM-DD
  location: string;
  notes: string;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'astroplan-checklists';

function getAll(): Record<string, DayChecklist> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, DayChecklist>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function getChecklist(dateId: string): DayChecklist | null {
  const all = getAll();
  return all[dateId] ?? null;
}

export function createChecklist(dateId: string, location: string): DayChecklist {
  const all = getAll();
  const now = new Date().toISOString();
  const checklist: DayChecklist = {
    dateId,
    location,
    notes: '',
    items: getDefaultItems(),
    createdAt: now,
    updatedAt: now,
  };
  all[dateId] = checklist;
  saveAll(all);
  return checklist;
}

export function updateChecklist(dateId: string, updates: Partial<DayChecklist>): DayChecklist | null {
  const all = getAll();
  if (!all[dateId]) return null;
  all[dateId] = { ...all[dateId], ...updates, updatedAt: new Date().toISOString() };
  saveAll(all);
  return all[dateId];
}

export function deleteChecklist(dateId: string) {
  const all = getAll();
  delete all[dateId];
  saveAll(all);
}

export function toggleItem(dateId: string, itemId: string): DayChecklist | null {
  const all = getAll();
  if (!all[dateId]) return null;
  const item = all[dateId].items.find((i) => i.id === itemId);
  if (item) item.checked = !item.checked;
  all[dateId].updatedAt = new Date().toISOString();
  saveAll(all);
  return all[dateId];
}

export function addItem(dateId: string, text: string): DayChecklist | null {
  const all = getAll();
  if (!all[dateId]) return null;
  all[dateId].items.push({
    id: `item-${Date.now()}`,
    text,
    checked: false,
  });
  all[dateId].updatedAt = new Date().toISOString();
  saveAll(all);
  return all[dateId];
}

export function removeItem(dateId: string, itemId: string): DayChecklist | null {
  const all = getAll();
  if (!all[dateId]) return null;
  all[dateId].items = all[dateId].items.filter((i) => i.id !== itemId);
  all[dateId].updatedAt = new Date().toISOString();
  saveAll(all);
  return all[dateId];
}

function getDefaultItems(): ChecklistItem[] {
  return [
    { id: 'cam', text: 'Camera + lens', checked: false },
    { id: 'tripod', text: 'Tripod', checked: false },
    { id: 'battery', text: 'Fully charged batteries', checked: false },
    { id: 'memory', text: 'Empty memory card', checked: false },
    { id: 'remote', text: 'Remote shutter / intervalometer', checked: false },
    { id: 'headlamp', text: 'Headlamp (red light mode)', checked: false },
    { id: 'dew', text: 'Dew heater / lens warmer', checked: false },
    { id: 'clothing', text: 'Warm clothing', checked: false },
  ];
}
