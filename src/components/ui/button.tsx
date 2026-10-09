import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { playSfx } from "@/lib/sfx";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold font-body ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-transparent hover:bg-muted hover:border-primary/40",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gaming: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow hover:-translate-y-0.5",
        gold: "bg-warning text-warning-foreground hover:bg-warning/90 hover:shadow-neon-gold",
        success: "bg-success text-success-foreground hover:bg-success/90",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Set false to suppress the global click SFX. */
  sfx?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, sfx = true, onClick, onMouseEnter, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (sfx) {
        try {
          if (variant === 'destructive') playSfx('error');
          else if (variant === 'success' || variant === 'gold') playSfx('success');
          else playSfx('click');
        } catch {/* ignore */}
      }
      onClick?.(e);
    };
    const handleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (sfx) { try { playSfx('hover'); } catch {/* ignore */} }
      onMouseEnter?.(e);
    };
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        onMouseEnter={handleEnter}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

