import { Box, Button, Grid, Input, Select } from "@mantine/core"
import { showNotification } from "@mantine/notifications"
import { useState } from "react"
import { useCreateUser } from "../Api/AuthApi"

type UsersFormValues = {
    name: string,
    email: string,
    role_id: "1" | "2",
    
}

export const UsersForm = ({ onCancel }: { onCancel: () => void }) => {
    const [values, setValues] = useState<UsersFormValues>({
        name: '',
        email: '',
        role_id: "1",
    })
    const [loading, setLoading] = useState<boolean>(false);
    
    const createUserMutation = useCreateUser();
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues({
            ...values,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async () => {
        const { name, email, role_id } = values;
        setLoading(true);
        try {
            const data = await createUserMutation.mutateAsync({ name, email, role_id });
            if(data.ok){
                showNotification({
                    message: "Usuario creado exitosamente",
                    color: "green",
                    autoClose: 3000,
                })
                return onCancel();
                
            }

            throw new Error(data.error)
        } catch (error) {
            console.log(error);
            if (error instanceof Error && error.message === "email_already_registered") {
                showNotification({
                    message: "El email ya está registrado",
                    color: "red",
                    autoClose: 3000,
                })
            }else{
                showNotification({
                    message: "Error al crear el usuario",
                    color: "red",
                    autoClose: 3000,
                })
            }
            
        }finally{
            setLoading(false);
        }
    }
    return (
        <Box p="md">
            <Grid gutter="md" align="stretch">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Input
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        placeholder="Nombre"
                        size="md"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Input
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        placeholder="Email"
                        type="email"
                        size="md"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Select
                        name="user_role"
                        value={values.role_id}
                        onChange={(value) => setValues({
                            ...values,
                            role_id: value as UsersFormValues["role_id"],
                        })}
                        data={[
                            { value: "1", label: "Administrador" },
                            { value: "2", label: "Usuario" },
                        ]}
                        placeholder="Rol"
                        size="md"
                        clearable={false}
                    />
                </Grid.Col>
                
            </Grid>
            <Button mt={10} loading={loading} disabled={loading} onClick={handleSubmit}>Guardar</Button>
        </Box>
    )
}