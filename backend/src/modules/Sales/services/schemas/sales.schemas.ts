export const SaleSource = ["WEB", "CAJA"] as const;
export type SaleSource = typeof SaleSource[number];

export const PaymentMethods = ["TARJETA", "EFECTIVO", "QR", "NINGUNO"] as const;
export type PaymentMethods = typeof PaymentMethods[number];

export type UserSale = {
    user_id?: string
}

export type SaleRequest = {
    payment_method: PaymentMethods
    source: SaleSource
    product_ids: string[]
    user_sale?: UserSale
    tax?: number
    loadedManually?: boolean
    manualProducts?: { quantity: number; title: string; price: number }[]
    payment_methods?: { method: PaymentMethods; amount: number }[]
}