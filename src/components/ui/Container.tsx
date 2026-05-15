import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** narrow=720 max for prose, default=1320 max for grids, wide=full padding only */
  size?: "narrow" | "default" | "wide";
  as?: "div" | "section" | "header" | "footer" | "main" | "article";
};

const sizeMap = {
  narrow: "max-w-[720px]",
  default: "max-w-[1320px]",
  wide: "max-w-none",
} as const;

export function Container({
  children,
  className,
  size = "default",
  as: Tag = "div",
}: Props) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-6 sm:px-10 lg:px-20",
        sizeMap[size],
        className
      )}
    >
      {children}
    </Tag>
  );
}
