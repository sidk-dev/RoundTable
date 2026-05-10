export default function Button({
  children = "Button",
  buttonColor = "bg-primary-400",
  textColor = "text-t-primary",
  isBold = false,
  className = "",
  ...props
}) {
  return (
    <button
      className={`relative inline-flex cursor-pointer select-none focus:outline-none group ${className}`}
      {...props}
    >
      <span
        className={`absolute inset-0 translate-x-0 translate-y-0 rounded-xl border-dashed transition-all duration-150 group-hover:translate-x-0.5 group-hover:translate-y-0.5 ${isBold ? "border-2" : "border"} ${textColor}`}
      />

      <span
        className={`relative z-10 inline-flex items-center justify-center rounded-xl px-4 py-2 whitespace-nowrap text-sm tracking-wide transition-all duration-150 ease-out group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 shadow-sm group-hover:shadow-md ${isBold ? "font-semibold border-2" : "font-medium border"} ${buttonColor} ${textColor}`}
      >
        {children}
      </span>
    </button>
  );
}
