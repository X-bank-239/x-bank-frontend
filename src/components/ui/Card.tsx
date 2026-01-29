import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Небольшая цветная полоска слева (стиль банковских карточек) */
  accent?: boolean;
}

export function Card({ className, children, accent, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card",
        "overflow-hidden",
        accent && "border-l-4 border-l-primary-500 dark:border-l-primary-500",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("px-5 pt-5 pb-2", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: CardProps) {
  return (
    <h3 className={cn("text-base font-semibold text-slate-800 dark:text-slate-100", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("px-5 pb-5 pt-0", className)} {...props}>
      {children}
    </div>
  );
}
