import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-4 data-[orientation=horizontal]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex items-center justify-center rounded-lg text-muted-foreground",
  {
    variants: {
      variant: {
        default: "w-fit bg-muted p-1 data-[orientation=vertical]:flex-col",
        line: "w-full justify-start gap-4 border-b border-border bg-transparent p-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:border-l",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        // Base styles
        "relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50",
        // Focus state
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // Default Variant styling
        "group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:px-3 group-data-[variant=default]/tabs-list:py-1.5",
        "group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm",
        // Line Variant styling
        "group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:py-2 group-data-[variant=line]/tabs-list:text-muted-foreground group-data-[variant=line]/tabs-list:hover:text-foreground",
        "group-data-[variant=line]/tabs-list:data-active:text-foreground group-data-[variant=line]/tabs-list:data-active:shadow-none",
        // Line Indicator (Active state bottom/left border)
        "group-data-[variant=line]/tabs-list:after:absolute group-data-[variant=line]/tabs-list:after:bg-primary group-data-[variant=line]/tabs-list:after:transition-all",
        "group-data-[variant=line]/tabs-list:data-[orientation=horizontal]:after:inset-x-0 group-data-[variant=line]/tabs-list:data-[orientation=horizontal]:after:bottom-[-1px] group-data-[variant=line]/tabs-list:data-[orientation=horizontal]:after:h-[2px]",
        "group-data-[variant=line]/tabs-list:data-[orientation=vertical]:after:inset-y-0 group-data-[variant=line]/tabs-list:data-[orientation=vertical]:after:left-[-1px] group-data-[variant=line]/tabs-list:data-[orientation=vertical]:after:w-[2px]",
        "group-data-[variant=line]/tabs-list:after:opacity-0 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn(
        "flex-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
