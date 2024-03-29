import { useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MdLock, MdLogout } from "react-icons/md";
import { FaChevronDown, FaUser } from "react-icons/fa";
import { RiEdit2Fill } from "react-icons/ri";
import { AppContext } from "../context";
import { image_base_url } from "../utils/url";

export const DropdownContainer = ({
  extraStyles = "",
  onClick,
  children,
  props = {},
}) => {
  return (
    <ul
      onClick={onClick}
      className={`absolute top-[110%] right-0 flex flex-col text-xs bg-white/30 backdrop-blur-[12px] rounded-md px-4 py-1 shadow-md border z-10 ${extraStyles}`}
      {...props}
    >
      {children}
    </ul>
  );
};

const Account = ({ toggle, setSingleToggle }) => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AppContext);
  const role = user?.admin_id ? user.role_id : "Admin";

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
  }, [setUser]);

  const arr = [
    {
      title: "Change Password",
      icon: <MdLock className="text-base text-primary-500" />,
      clickHandler: () => navigate("/change-password"),
    },
    {
      title: "Edit Profile",
      icon: <RiEdit2Fill className="text-base text-primary-500" />,
      clickHandler: () => navigate("/edit-profile"),
    },
    {
      title: "Log out",
      icon: <MdLogout className="text-base text-red-600" />,
      clickHandler: logout,
    },
  ];

  return (
    <div className="relative rounded-md min-w-max" id="account-menu">
      <div
        className="min-w-max flex items-center bg-gray-50 hover:bg-gray-100 p-1.5 px-2.5 rounded-md space-x-3 cursor-pointer"
        onClick={() => setSingleToggle("account", !toggle)}
      >
        {user.profile_image ? (
          <img
            className="w-[35px] h-[35px] rounded-full text-xs bg-gray-100"
            src={image_base_url + user.profile_image}
            alt="profile"
          />
        ) : (
          <div className="w-[35px] h-[35px] flex items-center justify-center bg-gray-200 mx-1 mr-0 rounded-full">
            <FaUser className="text-gray-400/70" />
          </div>
        )}
        <p className="flex flex-col text-xs font-medium capitalize whitespace-nowrap">
          {user?.name}
          <span className="text-[10px] font-normal">{role}</span>
        </p>
        <FaChevronDown className={`text-sm ${toggle ? "rotate-180" : ""}`} />
      </div>
      {toggle && (
        <DropdownContainer extraStyles="!w-full !min-w-max !p-1 overflow-hidden">
          {arr.map((elem, indx) => (
            <li
              key={elem.title}
              onClick={elem.clickHandler}
              className={`flex ${
                indx === arr.length - 1
                  ? "hover:!bg-red-300/40 hover:text-red-600"
                  : indx === 0
                  ? "mb-0"
                  : "my-0"
              } rounded-md p-2 cursor-pointer text-gray-800 hover:bg-primary-200/40 hover:text-black`}
            >
              {elem.icon}
              <span className="ml-2 whitespace-nowrap">{elem.title}</span>
            </li>
          ))}
        </DropdownContainer>
      )}
    </div>
  );
};

export default Account;
