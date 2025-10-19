import { Box, Flex, Paper, Tabs, Title } from "@mantine/core";
import LoginForm, { type LoginFormValues } from "../components/Auth/LoginForm";
import RegisterForm, { type RegisterFormValues } from "../components/Auth/RegisterForm";
import { useState } from "react";
import { baseUrl } from "@/components/Api/index";
import { notifications } from '@mantine/notifications';
import { email_already_registered, invalid_password } from "@/Utils/ErrorHandlers";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [formType, setFormType] = useState<"register" | "login">("login");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: object) => {
    try {
      if (formType === "login") {
        setLoading(true)
        const typedValues = values as LoginFormValues
        const url = `${baseUrl}/login`;
        const result = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(typedValues),
        });
        const data = await result.json();
        console.log(data)
        if (data.ok) {
          setLoading(false);
          notifications.show({
            title: `Bienvenido/a ${data.user.name}`,
            message: "",
            color: "green",
            autoClose: 1000,
          });
          navigate("/");
        } else {
          notifications.show({
            title: "Error",
            message:
              data.error === "invalid_password"
                ? invalid_password
                : data.error,
            color: "red",
            autoClose: 3000,
          });
        }
      } else {
        setLoading(true);
        const typedValues = values as RegisterFormValues;
        const url = `${baseUrl}/register`;
        const result = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(typedValues),
        });
        const data = await result.json();
        console.log(data);
        if (data.ok) {
          setLoading(false);
          notifications.show({
            title: "Registro exitoso",
            message: "Te has registrado exitosamente, puedes iniciar sesión",
            color: "green",
            autoClose: 3000,
          });
          setFormType("login");
        } else {
          notifications.show({
            title: "Error",
            message:
              data.error === "email_already_registered"
                ? email_already_registered
                : data.error,
            color: "red",
            autoClose: 3000,
          });
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      notifications.show({
        title: "Error",
        message: message || "Error inesperado",
        color: "red",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Flex
      justify="center"
      align="center"
      style={{ height: "100vh" }}
    >
      <Box m="auto" style={{ maxWidth: 420 }}>
        <Title mb="md" c={"#2b2364"}>Bienvenido a Cinnamon</Title>
        <Paper withBorder p="md" radius="md">
          <Tabs defaultValue="login" value={formType} onChange={(v) => setFormType(v as "register" | "login")}>
            <Tabs.List>
              <Tabs.Tab value="login">Iniciar sesión</Tabs.Tab>
              <Tabs.Tab value="register">Registrarme</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="login" pt="md">
              <LoginForm onSubmit={(v) => handleSubmit(v)} loading={loading} />
            </Tabs.Panel>
            <Tabs.Panel value="register" pt="md">
              <RegisterForm onSubmit={(v) => handleSubmit(v)} loading={loading} />
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Box>
    </Flex>
  );
}