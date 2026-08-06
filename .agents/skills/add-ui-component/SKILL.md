---
name: add-ui-component
description: Step-by-step guide for creating accessible Radix UI and Tailwind CSS components adhering to the design system.
---

# UI Component Recipe

All UI components reside in `src/components/ui/` and adhere to shadcn/ui and Radix UI patterns.

## Design Rules
1. **Semantic Color Tokens**: Always use `bg-background`, `text-foreground`, `border-border`, `bg-muted`, `bg-card`, etc.
2. **Animation**: Use subtle transitions (`transition-all duration-150`, `active:scale-[0.98]`).
3. **Class Merging**: Always combine className with `cn(...)` from `src/lib/utils.ts`.

## Component Template (e.g. `src/components/ui/tooltip.tsx`)

```typescript
import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
```
