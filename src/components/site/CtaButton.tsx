import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "light" | "soft";
  external?: boolean;
  className?: string;
};

export function CtaButton({
  href,
  children,
  variant = "primary",
  external,
  className = "",
}: Props) {
  const cls = `btn btn--${variant}${className ? ` ${className}` : ""}`;
  if (external) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link className={cls} href={href}>
      {children}
    </Link>
  );
}
