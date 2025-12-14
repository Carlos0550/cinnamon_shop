import { Button, Flex, Group, Stack, TextInput, Title, ActionIcon, Text, Divider, Paper, Textarea, Tooltip } from "@mantine/core";
import Loading from "../Loader/Loading";
import { useBusinessForm } from "./useBusinessForm";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity, FaBuilding, FaUniversity, FaCreditCard, FaTrash, FaPlus, FaSave, FaMagic } from "react-icons/fa";

export default function BusinessForm() {
  const { 
    form, 
    errors, 
    isLoading, 
    isSubmitting, 
    handleChange, 
    handleBankChange, 
    addBankAccount, 
    removeBankAccount,
    handleSubmit,
    handleGenerateDescription,
    isGeneratingDescription
  } = useBusinessForm();

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h={200}>
        <Loading />
      </Flex>
    );
  }

  return (
    <Paper shadow="xs" p="md" radius="md" withBorder>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Title order={3}>Información del negocio</Title>
          
          <Group grow align="flex-start">
            <TextInput 
              label="Nombre" 
              placeholder="Nombre del negocio"
              value={form.name} 
              onChange={(e) => handleChange("name", e.currentTarget.value)} 
              error={errors.name}
              leftSection={<FaUser size={14} />}
              withAsterisk
            />
            <TextInput 
              label="Email" 
              placeholder="correo@ejemplo.com"
              value={form.email} 
              onChange={(e) => handleChange("email", e.currentTarget.value)} 
              error={errors.email}
              leftSection={<FaEnvelope size={14} />}
              withAsterisk
            />
          </Group>

          <Group grow align="flex-start">
            <TextInput 
              label="Teléfono" 
              placeholder="+1234567890"
              value={form.phone} 
              onChange={(e) => handleChange("phone", e.currentTarget.value)} 
              error={errors.phone}
              leftSection={<FaPhone size={14} />}
              withAsterisk
            />
            <TextInput 
              label="Dirección" 
              placeholder="Calle Principal 123"
              value={form.address} 
              onChange={(e) => handleChange("address", e.currentTarget.value)} 
              error={errors.address}
              leftSection={<FaMapMarkerAlt size={14} />}
            />
          </Group>

          <Group grow align="flex-start">
            <TextInput 
              label="Ciudad" 
              placeholder="Ciudad"
              value={form.city} 
              onChange={(e) => handleChange("city", e.currentTarget.value)} 
              error={errors.city}
              leftSection={<FaCity size={14} />}
            />
            <TextInput 
              label="Provincia/Estado" 
              placeholder="Estado"
              value={form.state} 
              onChange={(e) => handleChange("state", e.currentTarget.value)} 
              error={errors.state}
              leftSection={<FaBuilding size={14} />}
            />
          </Group>

          <Stack gap={0}>
             <Group justify="space-between" align="center" mb={5}>
                <Text size="sm" fw={500}>Descripción del negocio</Text>
                <Tooltip label="Mejorar con IA">
                  <ActionIcon 
                    variant="light" 
                    color="grape" 
                    onClick={handleGenerateDescription} 
                    loading={isGeneratingDescription}
                  >
                    <FaMagic size={14} />
                  </ActionIcon>
                </Tooltip>
             </Group>
             <Textarea
              placeholder="Descripción breve del negocio (para SEO y metadatos)"
              value={form.description || ""}
              onChange={(e) => handleChange("description", e.currentTarget.value)}
              minRows={3}
             />
          </Stack>

          <Divider my="sm" label="Datos Bancarios" labelPosition="center" />

          {form.bankData.map((b, idx) => {
            const bankErrors = errors.bankData?.[idx];
            return (
              <Paper key={idx} withBorder p="sm" radius="sm">
                <Group align="flex-start" mb={5}>
                    <Text size="sm" fw={500} c="dimmed">Cuenta #{idx + 1}</Text>
                    {form.bankData.length > 1 && (
                        <ActionIcon color="red" variant="subtle" onClick={() => removeBankAccount(idx)} aria-label="Eliminar cuenta">
                            <FaTrash size={14} />
                        </ActionIcon>
                    )}
                </Group>
                <Group grow align="flex-start">
                  <TextInput 
                    label="Banco" 
                    placeholder="Nombre del banco"
                    value={b.bank_name} 
                    onChange={(e) => handleBankChange(idx, "bank_name", e.currentTarget.value)} 
                    error={bankErrors?.bank_name}
                    leftSection={<FaUniversity size={14} />}
                  />
                  <TextInput 
                    label="Número de cuenta" 
                    placeholder="0000-0000-0000"
                    value={b.account_number} 
                    onChange={(e) => handleBankChange(idx, "account_number", e.currentTarget.value)} 
                    error={bankErrors?.account_number}
                    leftSection={<FaCreditCard size={14} />}
                  />
                  <TextInput 
                    label="Titular" 
                    placeholder="Nombre del titular"
                    value={b.account_holder} 
                    onChange={(e) => handleBankChange(idx, "account_holder", e.currentTarget.value)} 
                    error={bankErrors?.account_holder}
                    leftSection={<FaUser size={14} />}
                  />
                </Group>
              </Paper>
            );
          })}

          <Group>
            <Button 
                variant="light" 
                leftSection={<FaPlus size={14} />} 
                onClick={addBankAccount}
            >
                Agregar cuenta
            </Button>
          </Group>

          <Group justify="flex-end" mt="md">
            <Button 
                type="submit" 
                loading={isSubmitting} 
                leftSection={<FaSave size={14} />}
                disabled={isSubmitting}
            >
              {form.id ? "Actualizar Información" : "Crear Negocio"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}

