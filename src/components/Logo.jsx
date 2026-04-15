function Logo({ className = "", ...props }) {
  return (
    <img
      src="/logo.png"
      alt="Logo"
      className={`h-8 w-auto ${className}`}
      {...props}
    />
  );
}

export default Logo;
