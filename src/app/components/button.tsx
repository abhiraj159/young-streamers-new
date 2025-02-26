import React from "react";

interface ButtonProps {
  onClick: () => void | Promise<void>;
  children: React.ReactNode;
  className?: string; // ✅ Fix: Allow className
  variant?: "primary" | "secondary" | "danger" | "destructive"; // ✅ Fix: Allow "destructive"
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  className,
  disabled,
  variant = "primary",
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-blue-500 text-white hover:bg-blue-600";
      case "secondary":
        return "bg-gray-500 text-white hover:bg-gray-600";
      case "danger":
        return "bg-red-500 text-white hover:bg-red-600";
      default:
        return "bg-blue-500 text-white hover:bg-blue-600";
    }
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded ${getVariantClasses()}`}
    >
      {children}
    </button>
  );
};

export default Button;
