// src/components/ModernCard.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-white/50 backdrop-blur-lg shadow-lg rounded-2xl p-6 transition-transform duration-300 hover:scale-105 hover:shadow-2xl ring-1 ring-gray-200/30 ring-inset",
        className
      )}
      {...props}
    />
  );
}
export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 pb-4 border-b border-gray-200/30",
        className
      )}
      {...props}
    />
  );
}
export function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-lg md:text-xl font-semibold text-gray-800", className)}
      {...props}
    />
  );
}
export function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-gray-600 leading-relaxed", className)}
      {...props}
    />
  );
}
export function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("self-start justify-self-end", className)}
      {...props}
    />
  );
}
export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("px-6 py-4", className)} {...props} />
  );
}
export function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pt-4 border-t border-gray-200/30", className)}
      {...props}
    />
  );
}
