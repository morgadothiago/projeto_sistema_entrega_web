// BadgeIcon.tsx
import { type LucideIcon } from "lucide-react"

type BadgeIconProps = {
  icon: LucideIcon
  badge?: number
}

export default function BadgeIcon({ icon: Icon, badge }: BadgeIconProps) {
  return (
    <div className="relative flex items-center">
      <Icon className="w-5 h-5" />

      {badge && badge > 0 && (
        <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  )
}
