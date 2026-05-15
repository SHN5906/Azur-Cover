import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline-light";

type CommonProps = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  /** Auto-append "→" arrow that translates on hover */
  arrow?: boolean;
};

type LinkProps = CommonProps & {
  href: string;
  external?: boolean;
  type?: never;
  onClick?: never;
  disabled?: never;
};

type ButtonProps = CommonProps & {
  href?: undefined;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

const base =
  "group inline-flex items-center justify-center gap-2 text-sm font-medium leading-none transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azur focus-visible:ring-offset-4";

const variantMap: Record<Variant, string> = {
  primary:
    "h-12 rounded-lg bg-ink px-7 text-white shadow-sm hover:-translate-y-px hover:bg-graphite hover:shadow-lg active:translate-y-0",
  ghost:
    "h-12 px-1 text-ink underline-grow", // animated underline
  "outline-light":
    "h-12 rounded-lg border border-white/30 bg-transparent px-7 text-white hover:-translate-y-px hover:border-white/60 hover:bg-white/5",
};

function Inner({ children, arrow }: { children: React.ReactNode; arrow?: boolean }) {
  return (
    <>
      <span>{children}</span>
      {arrow && (
        <span
          aria-hidden
          className="inline-block transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
        >
          →
        </span>
      )}
    </>
  );
}

export function Button(props: LinkProps | ButtonProps) {
  const { children, variant = "primary", className, arrow } = props;
  const cls = cn(base, variantMap[variant], className);

  if (props.href !== undefined) {
    if (props.external) {
      return (
        <a
          href={props.href}
          target="_blank"
          rel="noreferrer noopener"
          className={cls}
          data-cursor="hover"
        >
          <Inner arrow={arrow}>{children}</Inner>
        </a>
      );
    }
    return (
      <Link href={props.href} className={cls} data-cursor="hover">
        <Inner arrow={arrow}>{children}</Inner>
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      className={cls}
      data-cursor="hover"
    >
      <Inner arrow={arrow}>{children}</Inner>
    </button>
  );
}
