"use client";
import { useEffect, useRef, useState } from "react";
import { useAppContext } from "@/providers/AppContext";
import { Button, Stack, TextInput, Title, Text, Flex, PasswordInput, Group } from "@mantine/core";
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
  const [recoverMode, setRecoverMode] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState("");
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

  const onRecover = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${utils.baseUrl}/shop/password/reset`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: recoverEmail }) });
      const ok = res.ok;
      if (!ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error(err?.error || 'reset_failed');
      }
      showNotification({ title: 'Correo enviado', message: 'Revisa tu bandeja: te enviamos una contraseña temporal de 6 dígitos.', color: 'green', autoClose: 4000 });
      setRecoverMode(false);
    } catch (e) {
      const er = e as Error;
      setError(er.message || 'Error al recuperar contraseña');
    } finally {
      setLoading(false);
    }
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, showClerkSignIn]);

  return (
    <Flex direction="column" gap="xs" maw={520} align="center" justify={"space-between"}>
        <Title order={3}>Iniciar sesión</Title>
        <Stack w={"100%"} p={"md"}>
          {!recoverMode && (
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
            <Button variant="subtle" onClick={() => setRecoverMode(true)}>Recuperar contraseña</Button>
          </Stack>
        </Form>
        )}
        {recoverMode && (
          <Stack gap="sm">
            <TextInput label="Correo" placeholder="tu@correo.com" value={recoverEmail} onChange={(e) => setRecoverEmail(e.currentTarget.value)} />
            {error && <Text c="red">{error}</Text>}
            <Group justify="space-between">
              <Button variant="light" onClick={() => setRecoverMode(false)}>Volver</Button>
              <Button onClick={onRecover} loading={loading} disabled={loading || !recoverEmail}>Enviar código</Button>
            </Group>
          </Stack>
        )}
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
