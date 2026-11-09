// Small class-name helper for composing optional Tailwind classes.
export function cn(...values) {
  return values.filter(Boolean).join(' ');
}
