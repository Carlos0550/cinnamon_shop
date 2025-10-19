import { useState } from "react";
import { Paper, Stack, TextInput, PasswordInput, Button, Group, Title, Text } from "@mantine/core";

export type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginForm({ onSubmit, loading }: { onSubmit?: (values: LoginFormValues) => void, loading?: boolean }) {
  const [values, setValues] = useState<LoginFormValues>({ email: "", password: "" });
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!values.email || !values.password) {
      setError("Completa email y contraseña");
      return;
    }
    onSubmit?.(values);
  };

  return (
    <Paper withBorder p="md" radius="md" component="form" onSubmit={handleSubmit}>
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
          <Button type="submit" loading={loading}>Entrar</Button>
        </Group>
      </Stack>
    </Paper>
  );
}