import { Box, Flex, Paper, Tabs, Title } from "@mantine/core";
import LoginForm from "../components/Auth/LoginForm";
import RegisterForm from "../components/Auth/RegisterForm";
import { useState } from "react";


export default function Login() {
  const [formType, setFormType] = useState<"register" | "login">("login");
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
              <RegisterForm/>
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Box>
    </Flex>
  );
}