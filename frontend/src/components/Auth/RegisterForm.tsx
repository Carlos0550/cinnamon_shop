import { useEffect, useState } from "react";
import { Paper, Stack, TextInput, PasswordInput, Button, Group, Title, Text } from "@mantine/core";

export type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterForm({ onSubmit, loading }: { onSubmit?: (values: RegisterFormValues) => void, loading?: boolean }) {
  const [values, setValues] = useState<RegisterFormValues>({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState<string>("");
  
  
  useEffect(()=> {
    console.log("Values", values);
  },[values])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!values.name || !values.email || !values.password || !values.confirmPassword) {
      setError("Completa todos los campos");
      return;
    }
    if (values.password !== values.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    onSubmit?.(values);
  };

  return (
    <Paper withBorder p="md" radius="md" component="form" onSubmit={handleSubmit}>
      <Stack>
        <Title order={4}>Registrarme</Title>
        <TextInput
          label="Nombre"
          placeholder="Tu nombre"
          value={values.name}
          onChange={(e) => {
            const val = e.currentTarget.value;
            setValues((v) => ({ ...v, name: val }));
          }}
          required
        />
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
        <PasswordInput
          label="Confirmar contraseña"
          placeholder="••••••••"
          value={values.confirmPassword}
          onChange={(e) => {
            const val = e.currentTarget.value;
            setValues((v) => ({ ...v, confirmPassword: val }));
          }}
          required
        />
        {error && (
          <Text c="red" size="sm">
            {error}
          </Text>
        )}
        <Group justify="flex-end">
          <Button type="submit" loading={loading}>Crear cuenta</Button>
        </Group>
      </Stack>
    </Paper>
  );
}