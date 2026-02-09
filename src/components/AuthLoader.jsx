export default function AuthLoader({ size = 72 }) {
  return (
    <div
      className="relative animate-spin rounded-full
                 bg-[conic-gradient(var(--color-primary),var(--color-accent),var(--color-primary))]
                 shadow-md"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-[14%] rounded-full bg-surface shadow-sm" />
    </div>
  );
}
