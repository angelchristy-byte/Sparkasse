export function formatEur(value: number, showPlus = false): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  if (value < 0) return `−${formatted} €`;
  if (showPlus && value > 0) return `+${formatted} €`;
  return `${formatted} €`;
}

export function formatNumberDe(value: number, decimals = 2): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
