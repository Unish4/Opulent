export type Paisa = number;

export function nprToPaisa(rupees: number): Paisa {
  if (!Number.isFinite(rupees) || rupees < 0) {
    throw new RangeError("Rupees must be a finite, non-negative number");
  }
  return Math.round(rupees * 100);
}

export function formatNpr(paisa: Paisa): string {
  if (!Number.isSafeInteger(paisa) || paisa < 0) {
    throw new RangeError("Paisa must be a non-negative safe integer");
  }
  const rupees = paisa / 100;
  const digits = paisa % 100 === 0 ? 0 : 2;
  const formatted = rupees.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `Rs ${formatted}`;
}
