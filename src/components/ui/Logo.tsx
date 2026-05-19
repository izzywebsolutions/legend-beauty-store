"use client"

import { useState } from "react"
import { getLogoPath } from "@/lib/getLogo"

export function Logo({ storeName, className }: { storeName?: string, className?: string }) {
  const logoFormats = getLogoPath()
  const [currentLogo, setCurrentLogo] = useState(0)

  return (
    <img
      src={logoFormats[currentLogo]}
      alt={storeName || "Legend Beauty Store"}
      className={className || "h-12 w-12 object-contain rounded-full border border-plum/10 bg-white"}
      onError={() => {
        if (currentLogo < logoFormats.length - 1) {
          setCurrentLogo(currentLogo + 1)
        }
      }}
    />
  )
}
