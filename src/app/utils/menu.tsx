import {
  Home,
  Car,
  DollarSign,
  User,
  RefreshCcw,
  Bell,
  Mail,
  Settings,
  Store,
  LayoutDashboard,
} from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"

export const items = [
  {
    title: "Home",
    subTile: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "simulate",
    subTile: "Simulação de entrega",

    url: "/store/simulate",
    icon: RefreshCcw,
  },
  {
    title: "delivryDetails",
    subTile: "Detalhes da entrega",
    url: "/store/delivery",
    icon: Car,
  },
  {
    title: "debts",
    subTile: "Débitos",
    url: "/store/debts",
    icon: DollarSign,
  },
  {
    title: "notification",
    subTile: "Notificações",
    url: "/store/notification",
    icon: Bell,
  },
]

export const itemAdm = [
  {
    title: "Dashboard",
    subTile: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tipo de veículos",
    subTile: "Tipo de veículos",
    url: "/admin/type-vehicle",
    icon: Car,
  },
  {
    title: "Logista",
    subTile: "Logista",
    url: "/admin/stores",
    icon: Store,
  },
  {
    title: "Entregadores",
    subTile: "Entregadores",
    url: "/admin/deliveryman",
    icon: User,
  },
  {
    title: "Notificações",
    subTile: "Notificações",
    url: "/admin/notification_admin",
    icon: Bell,
  },
]

export const itemSupport = [
  {
    title: "Email",
    action: "email",
    icon: Mail,
  },
  {
    title: "WhatsApp",
    action: "whatsapp",
    icon: FaWhatsapp,
  },
]
