import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   PageHeader — Consistent page title block
   ═══════════════════════════════════════════════════════════ */

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  children?: React.ReactNode; // For action buttons on the right
  className?: string;
}

export function PageHeader({
  title,
  description,
  showBackButton,
  onBackClick,
  children,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex items-start gap-4">
        {showBackButton && (
          <button
            onClick={onBackClick}
            className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg border bg-background hover:bg-muted transition-colors shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
          )}
        </div>
      </div>
      {children && <div className="flex items-center gap-2 pt-2 sm:pt-0">{children}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DataCard — Generic card wrapper for dashboard sections
   ═══════════════════════════════════════════════════════════ */

interface DataCardProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean; // For cards with lists that have their own padding
}

export function DataCard({ title, description, badge, children, className, noPadding = false }: DataCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card shadow-sm", className)}>
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {badge}
      </div>
      <div className={cn(!noPadding && "p-6")}>{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   StatCard — KPI metric card with trend indicator
   ═══════════════════════════════════════════════════════════ */

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  description?: string;
  tooltip?: string;
  className?: string;
}

import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  description,
  tooltip,
  className
}: StatCardProps) {
  const changeElement = (
    <span className={cn(
      "inline-flex items-center gap-0.5 text-xs font-medium cursor-help",
      changeType === "positive" && "text-success",
      changeType === "negative" && "text-destructive",
      changeType === "neutral" && "text-muted-foreground",
    )}>
      {changeType === "positive" && "↑"}
      {changeType === "negative" && "↓"}
      {change}
    </span>
  );

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <div className="flex items-center gap-1.5">
            {tooltip ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    {changeElement}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : changeElement}
            <span className="text-xs text-muted-foreground">{description}</span>
          </div>
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          {icon}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-primary/60 via-primary/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   StatusBadge — Semantic status indicator
   ═══════════════════════════════════════════════════════════ */

type StatusVariant = "success" | "warning" | "destructive" | "info" | "default";

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

const statusStyles: Record<StatusVariant, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info/10 text-info border-info/20",
  default: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ variant, children, pulse = false, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
      statusStyles[variant],
      className
    )}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning",
            variant === "destructive" && "bg-destructive",
            variant === "info" && "bg-info",
            variant === "default" && "bg-muted-foreground",
          )} />
          <span className={cn(
            "relative inline-flex h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning",
            variant === "destructive" && "bg-destructive",
            variant === "info" && "bg-info",
            variant === "default" && "bg-muted-foreground",
          )} />
        </span>
      )}
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   EmptyState — Placeholder for data-less sections
   ═══════════════════════════════════════════════════════════ */

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 px-6 py-16 text-center",
      className
    )}>
      <div className="rounded-full bg-muted p-4 text-muted-foreground mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ProgressBar — Animated horizontal bar
   ═══════════════════════════════════════════════════════════ */

interface ProgressBarProps {
  value: number;     // 0-100
  label?: string;
  sublabel?: string;
  color?: string;    // Tailwind bg class e.g. "bg-success"
  className?: string;
}

export function ProgressBar({ value, label, sublabel, color = "bg-primary", className }: ProgressBarProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || sublabel) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium">{label}</span>}
          {sublabel && <span className="text-muted-foreground">{sublabel}</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SectionDivider — Subtle labeled horizontal rule
   ═══════════════════════════════════════════════════════════ */

interface SectionDividerProps {
  label?: string;
  className?: string;
}

export function SectionDivider({ label, className }: SectionDividerProps) {
  if (!label) {
    return <hr className={cn("border-border my-6", className)} />;
  }
  return (
    <div className={cn("relative my-6", className)}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}
