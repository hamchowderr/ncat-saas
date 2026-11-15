import { UnifiedAuthForm } from "@/components/unified-auth-form";
import Image from "next/image";

export default function Page() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        {/* Background Logo - fills entire left side */}
        <Image
          src="/nocodearchetics.png"
          alt="NoCodeArchetics Logo"
          fill
          className="object-cover"
          priority
        />

        {/* Content overlay */}
        <div className="relative z-10 flex h-full w-full items-center justify-center bg-black/10">
          <div className="space-y-8 text-center px-8">
            <h2 className="text-4xl font-bold text-white drop-shadow-lg">Join NCAT Today</h2>
            <p className="max-w-md mx-auto text-xl text-white/90 drop-shadow-md">
              Start your journey with powerful media processing tools and cloud storage.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full items-center justify-center p-6 md:p-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <UnifiedAuthForm defaultMode="signup" />
        </div>
      </div>
    </div>
  );
}
