import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  tone?: "ink" | "muted" | "white";
  id?: string;
};

const toneMap = {
  ink: "text-ink",
  muted: "text-muted",
  white: "text-white/70",
} as const;

export function Eyebrow({ children, className, tone = "muted", id }: Props) {
  return (
    <span
      id={id}
      className={cn(
        "block font-mono text-[17px] uppercase",
        toneMap[tone],
        className
      )}
      style={{ letterSpacing: "0.18em" }}
    >
      {children}
    </span>
  );
}
