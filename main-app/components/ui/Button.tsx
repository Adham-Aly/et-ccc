import type { ButtonHTMLAttributes } from "react";
import { type ButtonSize, type ButtonVariant, buttonClass } from "./button-styles";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** Button (DESIGN.md → Buttons). Icon-only buttons must pass `aria-label`. */
export function Button({
  variant = "secondary",
  size = "md",
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...rest} />;
}
