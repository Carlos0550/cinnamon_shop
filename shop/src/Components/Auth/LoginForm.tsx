"use client";
import { useEffect, useRef, useState } from "react";
import { useAppContext } from "@/providers/AppContext";
import { Button, Stack, TextInput, Title, Text, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { SignIn, useAuth as useClerkAuth, useUser } from "@clerk/nextjs";

export default function LoginForm() {
  const { auth } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClerkSignIn, setShowClerkSignIn] = useState(false);
  const { isSignedIn } = useClerkAuth();
  const { user } = useUser();

  // useEffect(()=> {
  //   console.log(user)
  // },[user])

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
      await auth.signIn(values.email, values.password);
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
    <Stack p="md" gap="xs" maw={520}>
      <Title order={3}>Iniciar sesión</Title>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="sm">
          <TextInput
            label="Correo"
            placeholder="tu@correo.com"
            {...form.getInputProps("email")}
          />
          <TextInput
            label="Contraseña"
            placeholder="••••••••"
            type="password"
            {...form.getInputProps("password")}
          />
          {error && <Text c="red">{error}</Text>}
          <Button type="submit" loading={loading}>
            Entrar
          </Button>
        </Stack>
      </form>

      <Group mt="md">
        <Button variant="outline" color="blue" onClick={() => setShowClerkSignIn(true)}>
          Google
        </Button>
      </Group>

      {showClerkSignIn && (
        <Stack mt="md">
          <SignIn routing="hash" afterSignInUrl="/" afterSignUpUrl="/" />
        </Stack>
      )}
    </Stack>
  );
}
