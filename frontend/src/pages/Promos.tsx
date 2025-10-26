import ModalWrapper from "@/components/Common/ModalWrapper";
import { PromoForm } from "@/components/Promos/PromoForm";
import { Box, Button, Group, TextInput, Title } from "@mantine/core";
import { useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";

export function Promos() {
    const [opened, setOpened] = useState<boolean>(false)

    const handleToggle = () => {
        setOpened(!opened)
    }
    return (
        <Box>
            <Title mb={"md"}>Promociones</Title>
            <Group mb={"md"} gap={"md"} align="center" wrap="wrap">
                <TextInput
                    placeholder="Buscar por nombre o email"
                    leftSection={<FiSearch />}
                    style={{ flex: "1 1 280px", minWidth: 260, maxWidth: 520 }}
                    
                />
                <Button leftSection={<FiPlus />}
                    onClick={handleToggle}
                >Nueva promoción</Button>
            </Group>

            <ModalWrapper
                opened={opened}
                onClose={handleToggle}
                title="Nueva promoción"
                size={"xl"}
            >
                <PromoForm onClose={handleToggle}/>
            </ModalWrapper>
        </Box>
    )
}

