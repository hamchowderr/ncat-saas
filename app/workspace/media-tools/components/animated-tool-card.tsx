"use client";

import { useRef, MouseEvent, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { animate } from "animejs";
import { cn } from "@/lib/utils";

interface AnimatedToolCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number; // Controls tilt intensity (default: 10)
}

/**
 * Animated Tool Card with 3D Tilt Effect
 *
 * Wraps a card component with smooth 3D tilt animation on mouse move.
 * Perfect for tool grids and interactive cards.
 *
 * @param children - Card content (typically CardHeader)
 * @param className - Additional CSS classes
 * @param intensity - Tilt rotation intensity in degrees (default: 10)
 */
export function AnimatedToolCard({ children, className, intensity = 10 }: AnimatedToolCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt effect on mouse move
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -intensity;
    const rotateY = ((x - centerX) / centerX) * intensity;

    animate(card, {
      rotateX: `${rotateX}deg`,
      rotateY: `${rotateY}deg`,
      scale: 1.02,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
      duration: 200,
      ease: "outQuad"
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;

    animate(cardRef.current, {
      rotateX: "0deg",
      rotateY: "0deg",
      scale: 1,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      duration: 300,
      ease: "outQuad"
    });
  };

  return (
    <Card
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("cursor-pointer transition-shadow hover:shadow-md", className)}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}
    >
      {children}
    </Card>
  );
}
