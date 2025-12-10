import { useEffect, useState } from "react";
import { Button, Group, Stack, TextInput, Title } from "@mantine/core";
import { useCreateBusiness, useGetBusiness, useUpdateBusiness, type BusinessData } from "@/components/Api/BusinessApi";

export default function BusinessForm() {
  const { data } = useGetBusiness();
  const createMutation = useCreateBusiness();
  const updateMutation = useUpdateBusiness();

  const [form, setForm] = useState<BusinessData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    bankData: [{ bank_name: "", account_number: "", account_holder: "" }]
  });

  useEffect(() => {
    if (data) {
      setForm({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        bankData: Array.isArray(data.bankData) && data.bankData.length ? data.bankData : [{ bank_name: "", account_number: "", account_holder: "" }]
      });
    }
  }, [data]);

  const setField = (key: keyof BusinessData, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const setBankField = (idx: number, key: keyof BusinessData["bankData"][number], value: string) => {
    setForm(prev => ({
      ...prev,
      bankData: prev.bankData.map((b, i) => i === idx ? { ...b, [key]: value } : b)
    }));
  };

  return (
    <Stack>
      <Title order={3}>Información del negocio</Title>
      <TextInput label="Nombre" value={form.name} onChange={(e) => setField("name", e.currentTarget.value)} />
      <TextInput label="Email" value={form.email} onChange={(e) => setField("email", e.currentTarget.value)} />
      <TextInput label="Teléfono" value={form.phone} onChange={(e) => setField("phone", e.currentTarget.value)} />
      <TextInput label="Dirección" value={form.address} onChange={(e) => setField("address", e.currentTarget.value)} />
      <TextInput label="Ciudad" value={form.city} onChange={(e) => setField("city", e.currentTarget.value)} />
      <TextInput label="Provincia/Estado" value={form.state} onChange={(e) => setField("state", e.currentTarget.value)} />

      {form.bankData.map((b, idx) => (
        <Group key={idx} grow>
          <TextInput label="Banco" value={b.bank_name} onChange={(e) => setBankField(idx, "bank_name", e.currentTarget.value)} />
          <TextInput label="Número de cuenta" value={b.account_number} onChange={(e) => setBankField(idx, "account_number", e.currentTarget.value)} />
          <TextInput label="Titular" value={b.account_holder} onChange={(e) => setBankField(idx, "account_holder", e.currentTarget.value)} />
        </Group>
      ))}
      <Group>
        <Button variant="light" onClick={() => setForm(prev => ({ ...prev, bankData: [...prev.bankData, { bank_name: "", account_number: "", account_holder: "" }] }))}>Agregar cuenta</Button>
      </Group>

      <Group justify="flex-end">
        {form.id ? (
          <Button loading={updateMutation.isPending} onClick={() => updateMutation.mutate({ id: form.id!, payload: form })}>Actualizar</Button>
        ) : (
          <Button loading={createMutation.isPending} onClick={() => createMutation.mutate(form)}>Crear</Button>
        )}
      </Group>
    </Stack>
  );
}

