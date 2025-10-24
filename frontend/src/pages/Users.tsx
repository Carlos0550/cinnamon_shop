import { useState } from "react";
import { Box, Group, Title, TextInput, Button } from "@mantine/core";

import { FiSearch } from "react-icons/fi";
import ModalWrapper from "@/components/Common/ModalWrapper";
import { UsersForm } from "@/components/Users/UsersForm";
import { UsersTable } from "@/components/Users/UsersTable";

export default function Users() {

  //const theme = useMantineTheme();
  //const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [search] = useState<string>('');

  const [opened, setOpened] = useState<boolean>(false)
  return (
    <Box>
      <Title mb="md">Usuarios</Title>

      <Group mb="md" gap="md" align="center" wrap="wrap">
        <TextInput
          placeholder="Buscar por nombre o email"
          leftSection={<FiSearch />}
          style={{ flex: "1 1 280px", minWidth: 260, maxWidth: 520 }}
        />
        <Button onClick={() => setOpened(true)}>Nuevo usuario</Button>
      </Group>
      <UsersTable search={search} />
      <ModalWrapper
        opened={opened}
        onClose={() => setOpened(false)}
        title="Nuevo usuario"
        size="lg"
      >
        <UsersForm onCancel={() => setOpened(false)} />
      </ModalWrapper>

    </Box>
  );
}