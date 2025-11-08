import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ReactNode } from "react";

interface TabOption {
  value: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface DashboardTabsProps {
  options: TabOption[];
  defaultValue?: string;
  className?: string;
}

export function DashboardTabs({
  options,
  defaultValue,
  className,
}: DashboardTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue || options[0].value}
      className={`space-y-8 md:mt-10 mt-20 mb-8 ${className || ""}`}
    >
      <TabsList className="w-full flex flex-col gap-4 sm:flex-row sm:gap-6 justify-center items-center mt-2">
        {options.map((opt) => (
          <TabsTrigger
            key={opt.value}
            value={opt.value}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-[clamp(0.95rem,2.5vw,1.15rem)] rounded-2xl transition-all duration-300 hover:scale-105 py-3 sm:py-3 font-semibold min-h-[48px] shadow-md"
          >
            {opt.icon}
            <span className="hidden sm:inline">{opt.label}</span>
            <span className="sm:hidden">
              {opt.label.length > 10 ? opt.label.slice(0, 10) + "…" : opt.label}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      {options.map((opt) => (
        <TabsContent key={opt.value} value={opt.value}>
          {opt.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
