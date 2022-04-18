export const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;

export const clamp = (a: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, a));

export const invlerp = (x: number, y: number, a: number) =>
  clamp((a - x) / (y - x));

export const range = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  a: number
) => lerp(x2, y2, invlerp(x1, y1, a));

export const easeInOutExpo = (t: number, b: number, _c: number, d: number) => {
  const c = _c - b;
  if (t === 0) {
    return b;
  }
  if (t === d) {
    return b + c;
  }
  if ((t /= d / 2) < 1) {
    return (c / 2) * Math.pow(2, 10 * (t - 1)) + b;
  } else {
    return (c / 2) * (-Math.pow(2, -10 * --t) + 2) + b;
  }
};
