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
      className={`relative block group cursor-pointer ${textColor} ${className}`}
      {...props}
      // onClick={(e) => onClick && onClick(e)}
    >
      <span
        className={`absolute inset-0 border-dashed rounded-lg ${isBold ? "border-2" : "border"} ${textColor}`}
      ></span>
      <div
        className={`transition rounded-lg group-hover:-translate-x-1 group-hover:-translate-y-1 ${buttonColor} ${isBold ? "border-2" : "border"} ${textColor} `}
      >
        <div className="py-1 px-2">
          <p
            className={`flex justify-center align-middle whitespace-nowrap ${isBold ? "font-medium" : "font-normal"} ${textColor}`}
          >
            {children}
          </p>
        </div>
      </div>
    </button>
  );
}
