export default function Footer() {
  return (
    <footer className="bg-surface text-t-secondary border-t border-border shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
        <span>
          © 2026 <span className="text-t-primary font-medium">Round Table</span>
          . All rights reserved.
        </span>

        <span className="text-t-muted">
          ✨ Built with care by{" "}
          <span className="text-t-primary font-medium">Siddharth</span>
        </span>
      </div>
    </footer>
  );
}
