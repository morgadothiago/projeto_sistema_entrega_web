import Axios from "axios"

// Use environment variable or fallback to relative path for production
const baseURL = typeof window !== 'undefined'
  ? window.location.origin
  : process.env.NEXT_PUBLIC_NEXTAUTH_API_HOST || "http://localhost:3000"

export const notiFicationApi = Axios.create({
    baseURL
})