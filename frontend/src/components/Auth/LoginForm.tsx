import { useState, useEffect } from "react";
import { Paper, Stack, TextInput, PasswordInput, Button, Group, Title, Text } from "@mantine/core";
import { useLogin } from "../Api/AuthApi";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import { useAppContext } from "@/Context/AppContext";

export type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginForm(){
  const [values, setValues] = useState<LoginFormValues>({ email: "", password: "" });
  const [error, setError] = useState<string>("");
  const {
    utils:{
      capitalizeTexts,
      isMobile
    },
    auth:{
      setSession,
      setToken
    }
  } = useAppContext()
  const loginHook = useLogin()
  const navigate = useNavigate()

  useEffect(() => {
    if (loginHook.isSuccess && loginHook.data) {
      setSession(loginHook.data.user)
      setToken(loginHook.data.token)
      navigate("/");
      showNotification({
        title: "Inicio de sesión exitoso",
        message: `Bienvenido ${capitalizeTexts(loginHook.data?.user?.name || "usuario")}`,
        color: "green",
      });
    }
  }, [loginHook.isSuccess]);

  useEffect(() => {
    if (loginHook.isError && loginHook.error) {
      const errorMessage = loginHook.error instanceof Error 
        ? loginHook.error.message 
        : "Error al iniciar sesión";
      
      showNotification({
        title: "Error de inicio de sesión",
        message: errorMessage,
        color: "red",
      });
    }
  }, [loginHook.isError, loginHook.error]);

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!values.email || !values.password) {
      setError("Completa email y contraseña");
      return;
    }

    loginHook.mutate(values);
  };

  return (
    <Paper withBorder p="md" radius="md" component="form" onSubmit={handleSubmit} w={isMobile ? "100%" : 420}>
      <Stack>
        <Title order={4}>Iniciar sesión</Title>
        <TextInput
          label="Email"
          placeholder="tu@email.com"
          value={values.email}
          onChange={(e) => {
            const val = e.currentTarget.value;
            setValues((v) => ({ ...v, email: val }));
          }}
          required
        />
        <PasswordInput
          label="Contraseña"
          placeholder="••••••••"
          value={values.password}
          onChange={(e) => {
            const val = e.currentTarget.value;
            setValues((v) => ({ ...v, password: val }));
          }}
          required
        />
        {error && (
          <Text c="red" size="sm">
            {error}
          </Text>
        )}
        <Group justify="flex-end">
          <Button type="submit" loading={loginHook.isPending} disabled={loginHook.isPending}>Entrar</Button>
        </Group>
      </Stack>
    </Paper>
  );
}