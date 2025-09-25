"use client";

import { usePathname } from "next/navigation";

const pageMapping: Record<string, { title: string; description: string }> = {
  "/settings": {
    title: "Settings",
    description: "Manage your account settings and set e-mail preferences."
  },
  "/settings/profile": {
    title: "Profile",
    description: "This is how others will see you on the site."
  },
  "/settings/account": {
    title: "Account",
    description: "Update your account settings and preferences."
  },
  "/settings/appearance": {
    title: "Appearance",
    description:
      "Customize the appearance of the app. Automatically switch between day and night themes."
  },
  "/settings/display": {
    title: "Display",
    description: "Turn items on or off to control what's displayed in the app."
  }
};

export function SettingsHeader() {
  const pathname = usePathname();
  const currentPage = pageMapping[pathname] || pageMapping["/settings"];

  return (
    <div className="mb-6 space-y-0.5">
      <h2 className="text-2xl font-bold tracking-tight">{currentPage.title}</h2>
      <p className="text-muted-foreground">{currentPage.description}</p>
    </div>
  );
}
