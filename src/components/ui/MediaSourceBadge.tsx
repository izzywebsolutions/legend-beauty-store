"use client"

import { getMediaSource } from "@/lib/media-source-utils"
import { cn } from "@/lib/utils"

interface MediaSourceBadgeProps {
  url: string;
  className?: string;
}

export function MediaSourceBadge({ url, className }: MediaSourceBadgeProps) {
  const { source, color } = getMediaSource(url);

  const colorClasses: Record<string, string> = {
    green: "bg-green-50 text-green-700 border-green-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    gray: "bg-gray-50 text-gray-700 border-gray-100",
  };

  const dotClasses: Record<string, string> = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    gray: "bg-gray-400",
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shadow-sm",
      colorClasses[color],
      className
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClasses[color])} />
      {source}
    </div>
  );
}
