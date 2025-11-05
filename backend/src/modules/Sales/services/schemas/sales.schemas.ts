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
}