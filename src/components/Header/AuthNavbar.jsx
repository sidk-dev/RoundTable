import { ChevronDownIcon } from "@heroicons/react/24/outline";
import HoverButton from "../Button/HoverButton";
import { useNavigate } from "react-router";
import { authService } from "../../roundtable";
import Avatar from "../Avatar";

export default function AuthNavbar({
  auth,
  isUserMenuOpen,
  setIsUserMenuOpen,
  userMenuRef,
}) {
  const navigate = useNavigate();

  const userMenuItems = [
    { name: "Your Profile", link: "/profile" },
    { name: "Change Password", link: "/change-password" },
    { name: "Sign Out" },
  ];

  return (
    <div ref={userMenuRef} className="relative">
      <HoverButton
        onClick={() => setIsUserMenuOpen((p) => !p)}
        className="flex items-center gap-2"
      >
        <Avatar
          firstName={auth.user.firstName}
          lastName={auth.user.lastName}
          profileImage={auth.user.profileImage}
          size="sm"
        />
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
