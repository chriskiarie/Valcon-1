import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

type Variant = "solid" | "outline" | "on-dark";

type BaseProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
};

type LinkProps = BaseProps &
  Omit<ComponentProps<typeof Link>, "children" | "className">;

type NativeButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

type ButtonProps = LinkProps | NativeButtonProps;

function classesFor(variant: Variant, className: string) {
  return `btn btn--${variant} ${className}`.trim();
}

export default function Button(props: ButtonProps) {
  if ("href" in props) {
    const { children, className = "", variant = "solid", ...linkProps } = props;

    return (
      <Link
        className={classesFor(variant, className)}
        prefetch={false}
        {...linkProps}
      >
        {children}
      </Link>
    );
  }

  const {
    children,
    className = "",
    variant = "solid",
    type = "button",
    ...buttonProps
  } = props;

  return (
    <button
      className={classesFor(variant, className)}
      type={type}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
