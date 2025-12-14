import { BusinessBankData } from "@prisma/client"


export type BusinessDataRequest = {
    name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    description?: string
    bankData: BusinessBankData[]
}