export const formatNpr = (paisa: number): string => {
  const digits = paisa % 100 === 0 ? 0 : 2;
  const formatted = (paisa / 100).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `Rs ${formatted}`;
};

export const paisaToRupeeString = (paisa: number): string =>
  String(paisa / 100);
