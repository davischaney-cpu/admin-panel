export function formatScore(score: number | null | undefined) {
  if (score == null) return "—";
  return `${score.toFixed(2)}%`;
}
