const baseRoom = { width: 3.2, depth: 3, x: 0, z: -.4, rotation: 0 };

export const ROOM_PRESETS = Object.freeze([
  { id: 'clear', name: 'Area terbuka', note: 'Tanpa penghalang' },
  { id: 'door', name: 'Bukaan pintu', note: 'Penghalang di depan pintu' },
  { id: 'drawer', name: 'Bukaan laci', note: 'Penghalang di depan laci' },
].map(preset => Object.freeze({ ...preset, room: Object.freeze({ ...baseRoom, fixture: preset.id }) })));

// Give the engine a complete position each time. Edited room state never changes a preset.
export function roomForPreset(id) {
  const preset = ROOM_PRESETS.find(value => value.id === id);
  return preset ? { ...preset.room } : null;
}

export function matchRoomPreset(room) {
  if (!room || typeof room !== 'object') return null;
  return ROOM_PRESETS.find(preset => Object.entries(preset.room).every(([key, value]) => room[key] === value))?.id ?? null;
}
