import { Box, Flex, Paper, Tabs, Title } from "@mantine/core";
import LoginForm from "../components/Auth/LoginForm";
import RegisterForm from "../components/Auth/RegisterForm";
import { useState } from "react";
import { useRegister } from "@/components/Api/AuthApi";
import { showNotification } from "@mantine/notifications";


export default function Login() {
  const [formType, setFormType] = useState<"register" | "login">("login");
  const registerHook = useRegister();
  return (
    <Flex
      justify="center"
      align="center"
      style={{ height: "100vh" }}
    >
      <Box m="auto">
        <Title mb="md">Bienvenido a Cinnamon</Title>
        <Paper withBorder p="md" radius="md">
          <Tabs defaultValue="login" value={formType} onChange={(v) => setFormType(v as "register" | "login")}>
            <Tabs.List>
              <Tabs.Tab value="login">Iniciar sesión</Tabs.Tab>
              <Tabs.Tab value="register">Registrarme</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="login" pt="md">
              <LoginForm/>
            </Tabs.Panel>
            <Tabs.Panel value="register" pt="md">
              <RegisterForm
                loading={registerHook.isPending}
                onSubmit={(values) => {
                  registerHook.mutate({ name: values.name, email: values.email, password: values.password }, {
                    onSuccess: () => {
                      showNotification({ title: "Cuenta creada", message: "Ahora puedes iniciar sesión", color: "green" });
                      setFormType("login");
                    },
                    onError: (err: any) => {
                      const msg = err instanceof Error ? err.message : 'Error al registrarse';
                      showNotification({ title: "Error de registro", message: msg, color: "red" });
                    }
                  });
                }}
              />
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Box>
    </Flex>
  );
}
