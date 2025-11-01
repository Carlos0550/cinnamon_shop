import { baseUrl } from "@/components/Api"
import { showNotification } from "@mantine/notifications"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export type Session = {
    id: string,
    email: string,
    name: string,
    is_active: boolean,
    role: number
}

export function useAuth() {
    const [session, setSession] = useState<Session | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token')
        if (![null, "", undefined].includes(storedToken)) {
            setToken(storedToken)
        }else{
            navigate("/auth")
            localStorage.removeItem('auth_token')
            setToken(null)
            setSession(null)
        }
    }, [])

    const updateToken = (newToken: string | null) => {
        setToken(newToken)
        if (newToken) {
            localStorage.setItem('auth_token', newToken)
        } else {
            localStorage.removeItem('auth_token')
            setSession(null)
        }
    }

    const { data: validationData, isLoading, error, refetch } = useQuery({
        queryKey: ['validateToken', token],
        queryFn: async () => {
            if (!token) {
                console.log("No token available")
                throw new Error('No token available')
            }

            const response = await fetch(baseUrl + '/validate-token', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            
            if (!response.ok) {
                console.log("Token validation failed:", response.status, response.statusText)
                throw new Error('Token validation failed')
            }
            
            const data = await response.json()
            return data
        },
        enabled: !!token, 
        retry: false,
        staleTime: 5 * 60 * 1000, 
        refetchInterval: 5 * 60 * 1000, 
        refetchIntervalInBackground: true, 
    })

    useEffect(() => {
        if (validationData) {
            setSession(validationData)
        }
    }, [validationData])

    useEffect(() => {
        if (error) {
            console.error('Token validation error:', error)
            navigate("/auth")
            localStorage.removeItem('auth_token')
            setToken(null)
            setSession(null)
            showNotification({
                title: "Token inválido o sesión expirada",
                message: 'Por favor, inicie sesión de nuevo',
                color: 'red',
            })
        }
    }, [error, navigate])

    return {
        session,
        setSession,
        token,
        setToken: updateToken,
        loading: isLoading,
        refetchValidation: refetch
    }
}

