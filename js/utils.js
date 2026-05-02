// Utility Functions
export function categoryEmoji(cat) {
  return { waste: '🗑️', water: '💧', energy: '⚡', climate: '🌡️', forest: '🌲' }[cat] || '📋';
}

export function formatDate(ts) {
  if (!ts) return 'N/A';
  return new Date(ts.seconds * 1000).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function perfLabel(score) {
  if (score >= 80) return '🌟 Excellent';
  if (score >= 60) return '👍 Good';
  if (score >= 40) return '📈 Average';
  return '⚠️ Needs Help';
}

export function perfColor(score) {
  if (score >= 80) return 'bg-green-500/20 text-green-400';
  if (score >= 60) return 'bg-blue-500/20 text-blue-400';
  if (score >= 40) return 'bg-yellow-500/20 text-yellow-400';
  return 'bg-red-500/20 text-red-400';
}

export function generatePIN() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
