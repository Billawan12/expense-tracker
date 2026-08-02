"use client";
import * as React from "react";
import { GripVerticalIcon } from "lucide-react";
import { cn } from "./utils";

// Simple resizable panel components without external dependency
// This is a simplified version that works without react-resizable-panels

function ResizablePanelGroup({
  className,
  children,
  direction = "horizontal",
  ...props
}: React.ComponentProps<"div"> & {
  direction?: "horizontal" | "vertical";
}) {
  return (
    <div
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full",
        direction === "vertical" ? "flex-col" : "flex-row",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ResizablePanel({
  className,
  defaultSize,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultSize?: number;
}) {
  return (
    <div
      data-slot="resizable-panel"
      className={cn("flex-1 overflow-auto", className)}
      style={{ flexBasis: defaultSize ? `${defaultSize}%` : undefined }}
      {...props}
    >
      {children}
    </div>
  );
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  withHandle?: boolean;
}) {
  return (
    <div
      data-slot="resizable-handle"
      className={cn(
        "bg-border relative flex items-center justify-center",
        "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        "data-[panel-group-direction=horizontal]:h-full data-[panel-group-direction=horizontal]:w-px",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2",
        "focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-hidden",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </div>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };