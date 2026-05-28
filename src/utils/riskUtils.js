/** Normalize API / UI risk labels to Low | Moderate | High */
export const normalizeRiskLevel = (level) => {
  if (!level) return 'Unknown';
  const s = String(level).toLowerCase();
  if (s.includes('low')) return 'Low';
  if (s.includes('moderate')) return 'Moderate';
  if (s.includes('high')) return 'High';
  return level;
};

export const getRiskColorClasses = (level) => {
  switch (normalizeRiskLevel(level)) {
    case 'Low':
      return 'text-green-700 bg-green-50 border-green-200';
    case 'Moderate':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'High':
      return 'text-red-700 bg-red-50 border-red-200';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
};

export const getRiskDotColor = (level) => {
  switch (normalizeRiskLevel(level)) {
    case 'Low':
      return 'bg-green-500';
    case 'Moderate':
      return 'bg-amber-500';
    case 'High':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
};
