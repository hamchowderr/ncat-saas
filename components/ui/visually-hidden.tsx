import * as React from "react";

export const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ children, ...props }, ref) => {
  return (
    <span ref={ref} className="sr-only" {...props}>
      {children}
    </span>
  );
});

VisuallyHidden.displayName = "VisuallyHidden";
