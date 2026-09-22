// Botón al estilo shadcn/ui (cva + Slot), restyleado a la paleta del estudio.
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'press inline-flex items-center justify-center gap-2 rounded-xs font-medium whitespace-nowrap select-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-forest text-paper [@media(hover:hover)]:hover:bg-olive',
        whatsapp: 'bg-terra text-paper [@media(hover:hover)]:hover:bg-terra-dark',
        light: 'bg-paper text-forest [@media(hover:hover)]:hover:bg-bone',
        ghost: 'underline decoration-1 underline-offset-[6px] [@media(hover:hover)]:hover:decoration-terra',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-6 text-base',
        xl: 'h-16 px-8 text-lg md:h-20 md:px-10 md:text-xl',
        text: 'h-12 px-0 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
