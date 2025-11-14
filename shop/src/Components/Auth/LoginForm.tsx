"use client";
import { useEffect, useRef, useState } from "react";
import { useAppContext } from "@/providers/AppContext";
import { Button, Stack, TextInput, Title, Text, Group, Flex, PasswordInput } from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import { SignIn, useAuth as useClerkAuth } from "@clerk/nextjs";
import { FcGoogle } from "react-icons/fc";
import { showNotification } from "@mantine/notifications";


type Props = {
  onClose: () => void;
}
export default function LoginForm({ onClose }: Props) {
  const { auth, utils } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClerkSignIn, setShowClerkSignIn] = useState(false);
  const { isSignedIn } = useClerkAuth();

  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Email inválido"),
      password: (value) => (value.length >= 6 ? null : "Min 6 caracteres"),
    },
  });

  const onSubmit = async (values: { email: string; password: string }) => {
    setError(null);
    setLoading(true);
    try {
      const result = await auth.signIn(values.email, values.password);
      if (result?.user) {
        showNotification({
          title: `Bienvenido nuevamente ${utils.capitalizeTexts(result?.user?.name)}`,
          message: "",
          color: "green",
          autoClose: 3000,
        })
        onClose();
      }
    } catch (err) {
      const e = err as Error;
      setError(e?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const exchangedRef = useRef(false);
  useEffect(() => {
    const runExchange = async () => {
      if (showClerkSignIn && isSignedIn && !exchangedRef.current) {
        exchangedRef.current = true;
        try {
          setLoading(true);
          await auth.exchangeClerkToBackend();
        } catch (err) {
          const e = err as Error;
          setError(e?.message || "No se pudo crear sesión propia");
        } finally {
          setLoading(false);
          setShowClerkSignIn(false);
        }
      }
    };
    runExchange();
  }, [isSignedIn, showClerkSignIn]);

  return (
    <Flex direction="column" gap="xs" maw={520} align="center" justify={"space-between"}>
        <Title order={3}>Iniciar sesión</Title>
        <Stack w={"100%"} p={"md"}>
          <Form form={form} onSubmit={onSubmit}>
          <Stack gap="sm">
            <TextInput
              label="Correo"
              placeholder="tu@correo.com"
              {...form.getInputProps("email")}
            />
            <PasswordInput
              label="Contraseña"
              placeholder="••••••••"
              
              {...form.getInputProps("password")}
            />
            {error && <Text c="red">{error}</Text>}
            <Button type="submit" loading={loading}>
              Entrar
            </Button>
          </Stack>
        </Form>
        </Stack>
      {!showClerkSignIn && (
        <Flex direction={"column"} mt="md" gap="sm" align="center" justify={"space-between"}>
          <Text c="dimmed" >ó tambien</Text>
        <Button leftSection={<FcGoogle />} variant="outline" color="blue" onClick={() => setShowClerkSignIn(true)}>
          Ingresar con Google
        </Button>
      </Flex>
      )}

      {showClerkSignIn && (
        <Flex mt="md">
          <SignIn routing="hash" afterSignInUrl="/" afterSignUpUrl="/" />
        </Flex>
      )}
    </Flex>
  );
}
