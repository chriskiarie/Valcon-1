import type { ReactNode } from "react";

type Variant = "solid" | "outline" | "on-dark" | "on-dark-outline";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  ariaLabel?: string;
  target?: string;
  rel?: string;
};

export function Button({
  children,
  href,
  variant = "solid",
  className = "",
  type = "button",
  onClick,
  ariaLabel,
  target,
  rel,
}: ButtonProps) {
  const classes = `btn btn--${variant} ${className}`.trim();

  if (href) {
    return (
      <a
        className={classes}
        href={href}
        aria-label={ariaLabel}
        target={target}
        rel={rel}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={classes}
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
