export const nprToPaisa = (rupees: number): number => Math.round(rupees * 100);

export const formatNpr = (paisa: number): string => {
  const digits = paisa % 100 === 0 ? 0 : 2;
  const formatted = (paisa / 100).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `Rs ${formatted}`;
};
