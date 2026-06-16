export const PRESET_EXPENSE_CATEGORIES = [
  'Makanan',
  'Transportasi',
  'Pendidikan',
];

export const PRESET_INCOME_CATEGORIES = [
  'Gaji',
  'Uang Jajan',
];

export const PRESET_CATEGORIES = [
  ...new Set([...PRESET_EXPENSE_CATEGORIES, ...PRESET_INCOME_CATEGORIES]),
];
