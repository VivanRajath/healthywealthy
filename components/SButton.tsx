import { ArrowRight } from "lucide-react";

type Variant = "light" | "dark" | "glass";

/** Square label tile with a separate accent arrow tile. */
export function SButton({
  href,
  children,
  variant = "light",
  arrow = true,
  className = "",
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a href={href} className={`sbtn sbtn--${variant} ${className}`} onClick={onClick}>
      <span className="sbtn__label">{children}</span>
      {arrow && (
        <span className="sbtn__arrow" aria-hidden>
          <ArrowRight size={18} strokeWidth={1.8} />
        </span>
      )}
    </a>
  );
}
