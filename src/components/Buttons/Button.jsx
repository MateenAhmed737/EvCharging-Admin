import React from "react";
import Loader from "../Loaders/Loader";
import { cn } from "../../lib/utils";

const Button = ({
  title,
  handleClick,
  type = "button",
  extraStyles = "",
  className = "",
  isLoading,
  disabled = false,
  children,
}) => {
  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center justify-center px-6 py-2 text-xs font-medium text-center text-white rounded-md bg-primary-500 hover:bg-primary-600 focus:ring-4 focus:outline-none focus:ring-primary-500/50 disabled:opacity-70 disabled:py-0 disabled:hover:bg-primary-500 disabled:saturate-30 disabled:cursor-not-allowed",
        extraStyles,
        className
      )}
      type={type}
      disabled={disabled || isLoading}
    >
      {isLoading && <Loader extraStyles={"w-6 h-6 !bg-transparent !static"} />}
      {title}
      {children}
    </button>
  );
};

export default Button;
