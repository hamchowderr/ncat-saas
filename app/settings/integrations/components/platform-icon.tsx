"use client";

import { YoutubeIcon, VideoIcon, InstagramIcon, MusicIcon, GlobeIcon } from "lucide-react";
import type { CookiePlatform } from "@/lib/types/cookies";

interface PlatformIconProps {
  platform: CookiePlatform;
  className?: string;
}

export function PlatformIcon({ platform, className = "h-6 w-6" }: PlatformIconProps) {
  switch (platform) {
    case "youtube":
      return <YoutubeIcon className={className} />;
    case "vimeo":
      return <VideoIcon className={className} />;
    case "instagram":
      return <InstagramIcon className={className} />;
    case "tiktok":
      return <MusicIcon className={className} />;
    case "generic":
    default:
      return <GlobeIcon className={className} />;
  }
}
