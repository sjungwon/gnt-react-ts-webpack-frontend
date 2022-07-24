import { forwardRef, MouseEventHandler, ReactNode } from "react";
import styles from "./scss/DefaultButton.module.scss";

interface PropsType {
  children: ReactNode;
  size: "sm" | "md" | "lg" | "sq_md" | "xs" | "xl";
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
  color?: "blue" | "default";
}

//기본 버튼
const DefaultButton = forwardRef<HTMLButtonElement, PropsType>(
  (
    { children, size, onClick, className, disabled, color = "default" },
    buttonRef
  ) => {
    return (
      <button
        className={`${styles.btn} ${
          color !== "default" ? styles[`btn_${color}`] : ""
        } ${styles[`btn_${size}`]} ${className ? className : ""}`}
        onClick={onClick}
        disabled={disabled}
        ref={buttonRef}
      >
        {children}
      </button>
    );
  }
);

export default DefaultButton;
