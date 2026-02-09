export default function RootButton({
  children = "Button",
  buttonColor = "bg-primary",
  textColor = "text-white",
  isBold = false,
  className = "",
  ...props
}) {
  return (
    <button
      className={`w-full sm:w-auto px-8 py-3 cursor-pointer rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-transform duration-200 ${buttonColor} ${textColor} ${isBold ? "font-semibold" : "font-normal"} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
