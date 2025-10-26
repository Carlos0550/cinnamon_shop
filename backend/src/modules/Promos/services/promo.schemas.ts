export type PromoTypes = {
    PERCENTAJE: "PERCENTAJE",
    FIXED: "FIXED",
}

export type PromoRequest = {
    code?: string
    title?: string
    description?: string
    image?: string
    type?: PromoTypes
    value?: number
    max_discount?: number
    min_order_amount?: number
    start_date?: string
    end_date?: string
    is_active?: boolean
    usage_limit?: number
    usage_count?: number
    per_user_limit?: number
    show_in_home?: boolean
    categories?: string[]
    products?: string[]
}

