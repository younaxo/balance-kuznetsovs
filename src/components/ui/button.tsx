import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Кнопка — центральный интерактивный элемент дизайн-системы.
 * Варианты подобраны под язык бренда: заливка accent-цветом (коричневый
 * в светлой теме, белый в тёмной) как основной CTA, тонкий outline как
 * вторичное действие, "ghost" для навигации. Никакого дефолтного вида
 * shadcn (round-full, фиолетовые тени) — плоские грани, чёткие границы,
 * быстрый hover.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium tracking-wide transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.98]",
        outline:
          "border border-border-strong bg-transparent text-foreground hover:bg-muted active:scale-[0.98]",
        ghost: "bg-transparent text-foreground hover:bg-muted active:scale-[0.98]",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.98]",
        link: "text-foreground underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-13 px-8 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
