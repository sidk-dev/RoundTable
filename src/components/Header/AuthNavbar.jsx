import { ChevronDownIcon } from "@heroicons/react/24/outline";
import HoverButton from "../Button/HoverButton";
import { useNavigate } from "react-router";
import { authService } from "../../roundtable";

export default function AuthNavbar({
  auth,
  isUserMenuOpen,
  setIsUserMenuOpen,
  userMenuRef,
}) {
  const navigate = useNavigate();

  const userMenuItems = [
    { name: "Your Profile", link: "/profile" },
    { name: "Sign Out" },
  ];

  return (
    <div ref={userMenuRef} className="relative">
      <HoverButton
        onClick={() => setIsUserMenuOpen((p) => !p)}
        className="flex items-center gap-2"
      >
        {auth.user.profileImage ? (
          <img
            src={auth.user.profileImage}
            className="w-7 h-7 sm:w-8 sm:h-8 border border-border rounded-full"
          />
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface flex items-center justify-center font-semibold text-sm sm:text-base">
            {auth.user.name?.toUpperCase()[0] ?? "U"}
          </div>
        )}
        <ChevronDownIcon
          className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
            isUserMenuOpen ? "rotate-180" : ""
          }`}
        />
      </HoverButton>

      {isUserMenuOpen && (
        <div className="absolute right-0 mt-2 w-52 sm:w-56 rounded-lg bg-surface border border-border shadow-lg z-50">
          <div className="py-1 px-2">
            {userMenuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setIsUserMenuOpen(false);
                  item.name === "Sign Out"
                    ? authService.userLogout()
                    : navigate(item.link);
                }}
                className="w-full px-3 py-2 my-1 text-sm text-left rounded-md hover:bg-surface-elevated"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
