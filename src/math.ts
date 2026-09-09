export const percent = (n: number, d: number) => 100 * n / d;
export const curve = (a: number, x: number) => a * x * x;
export const slope = (a: number, x: number) => 2 * a * x;
export const tangent = (a: number, at: number, x: number) => slope(a, at) * (x - at) + curve(a, at);
export const format = (n: number) => new Intl.NumberFormat('da-DK', { maximumFractionDigits: 2 }).format(n);
export const parseAnswer = (text: string) => {
  const value = text.trim().replace(/\s*%$/, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : null;
};
