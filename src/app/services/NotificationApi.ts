import Axios from "axios"

export const notiFicationApi = Axios.create({
    baseURL: "http://localhost:3000/"
})