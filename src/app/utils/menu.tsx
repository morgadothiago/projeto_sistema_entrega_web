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

    url: "simulate",
    icon: RefreshCcw,
  },
  {
    title: "delivryDetails",
    subTile: "Detalhes da entrega",
    url: "/delivery",
    icon: Car,
  },
  {
    title: "debts",
    subTile: "Débitos",
    url: "/debts",
    icon: DollarSign,
  },
  {
    title: "notification",
    subTile: "Notificações",
    url: "/notification",
    icon: Bell,
  },
]

export const itemAdm = [
  {
    title: "/admin/type-vehicle",
    subTile: "Tipo de veiculos",
    url: "/type-vehicle",
    icon: Car,
  },
  {
    title: "/admin/listuser",
    subTile: "Listagem de Usuario",
    url: "/user",
    icon: User,
  },
  {
    title: "/admin/stores",
    subTile: "Logista",
    url: "/stores",
    icon: Store,
  },
]

export const itemSupport = [
  {
    title: "Email",
    action: () => {
      // Add your email action logic here
    },
    icon: Mail,
  },
  {
    title: "WhatsApp",
    action: () => {
      // Add your WhatsApp action logic here
    },
    icon: FaWhatsapp,
  },
]
