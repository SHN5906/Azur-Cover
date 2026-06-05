import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  tone?: "ink" | "muted" | "white";
  id?: string;
  /** Élément rendu. `span` par défaut ; passer `h2`/`h3` quand l'eyebrow
   *  est le seul intitulé d'une section (hiérarchie de titres correcte). */
  as?: "span" | "h2" | "h3" | "p" | "div";
};

const toneMap = {
  ink: "text-ink",
  muted: "text-muted",
  white: "text-white/70",
} as const;

export function Eyebrow({
  children,
  className,
  tone = "muted",
  id,
  as: Tag = "span",
}: Props) {
  return (
    <Tag
      id={id}
      className={cn(
        "block font-mono text-[17px] uppercase",
        toneMap[tone],
        className
      )}
      style={{ letterSpacing: "0.18em" }}
    >
      {children}
    </Tag>
  );
}
