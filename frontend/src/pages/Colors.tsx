import { useListPalettes, useCreatePalette, useActivatePalette, useSetUsage, useGeneratePalette, useRandomPalette } from "@/components/Api/PalettesApi";
import { Button, Container, Group, Stack, Table, TextInput, Title, Switch, ColorInput } from "@mantine/core";
import ModalWrapper from "@/components/Common/ModalWrapper";
import { useState } from "react";

export default function Colors() {
  const { data: palettes } = useListPalettes();
  const createMutation = useCreatePalette();
  const activateMutation = useActivatePalette();
  const setUsageMutation = useSetUsage();
  const generateMutation = useGeneratePalette();
  const randomMutation = useRandomPalette();
  const [name, setName] = useState("");
  const [colors, setColors] = useState<string[]>(Array.from({ length: 10 }, () => ""));
  const [prompt, setPrompt] = useState("");
  const [promptModal, setPromptModal] = useState(false);

  return (
    <Container>
      <Stack>
        <Title order={3}>Paletas de colores</Title>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Activa</Table.Th>
              <Table.Th>Admin</Table.Th>
              <Table.Th>Shop</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {palettes?.map((p) => (
              <Table.Tr key={p.id}>
                <Table.Td>{p.name}</Table.Td>
                <Table.Td>
                  <Switch checked={p.is_active} onChange={() => activateMutation.mutate({ id: p.id, active: !p.is_active })} size="sm"/>
                </Table.Td>
                <Table.Td>
                  <Switch checked={p.use_for_admin} onChange={() => setUsageMutation.mutate({ paletteId: p.id, target: "admin" })} size="sm"/>
                </Table.Td>
                <Table.Td>
                  <Switch checked={p.use_for_shop} onChange={() => setUsageMutation.mutate({ paletteId: p.id, target: "shop" })} size="sm"/>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <TextInput readOnly value={`ID: ${p.id}`} w={220} />
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        <Title order={4}>Crear nueva paleta</Title>
        <TextInput label="Nombre" value={name} onChange={(e) => setName(e.currentTarget.value)} />
        {colors.map((c, i) => (
          <ColorInput
            key={i}
            label={`Color ${i} — ${[
              'Background claro',
              'Background sutil',
              'Bordes/Separadores',
              'Texto suave',
              'Outline/Focus',
              'Componentes base',
              'Primario (main)',
              'Primario (hover)',
              'Primario (dark)',
              'Accentos/Dark'
            ][i]}`}
            placeholder="#ffffff"
            value={c}
            onChange={(val) => setColors(prev => prev.map((x, idx) => idx === i ? val : x))}
            format="hex"
            swatches={colors.filter(Boolean)}
          />
        ))}
        <Group justify="flex-end">
          <Button onClick={() => createMutation.mutate({ name, colors })} loading={createMutation.isPending}>Crear paleta</Button>
          <Button variant="light" onClick={() => setPromptModal(true)}>Generar con IA</Button>
          <Button variant="light" onClick={() => randomMutation.mutate(name)} loading={randomMutation.isPending}>Random</Button>
        </Group>

        <ModalWrapper opened={promptModal} onClose={() => setPromptModal(false)} title="Generar paleta con IA" size="md">
          <Stack>
            <TextInput label="Prompt" placeholder="Describe el estilo (p.ej. pastel elegante, vibrante gamer, minimal corporativo)" value={prompt} onChange={(e) => setPrompt(e.currentTarget.value)} />
            <Group justify="flex-end">
              <Button variant="light" onClick={() => setPromptModal(false)}>Cancelar</Button>
              <Button onClick={() => { generateMutation.mutate(prompt); setPromptModal(false); }} loading={generateMutation.isPending}>Generar</Button>
            </Group>
          </Stack>
        </ModalWrapper>
      </Stack>
    </Container>
  );
}
