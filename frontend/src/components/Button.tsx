import { ReactNode } from "react";

interface Props {
  category?: "primary" | "seconday" | "danger" | "warning";
  children: ReactNode;
  onClick: () => void;
}

const Button = ({ category = "primary", children, onClick }: Props) => {
  return (
    <button
      type="button"
      className={"btn " + "btn-" + category}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
