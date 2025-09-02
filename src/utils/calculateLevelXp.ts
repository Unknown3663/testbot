export default function calculateLevelXp(level: number): number {
  return 100 * level || 1;
}
