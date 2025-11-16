"use client";
import { Categories } from "@/Api/useCategories";
import { useAppContext } from "@/providers/AppContext";
import { Card, CardSection, Image, Text, Group, SimpleGrid, Button, Center, ThemeIcon } from "@mantine/core";


export default function CategoriesCards({ categories }: { categories: Categories[] }) {
  const {
    utils: { capitalizeTexts },
  } = useAppContext();

  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, md: 2, lg: 2 }}
      spacing="md"
    >
      {categories.map((category) => (
        <Card
          key={category.id}
          withBorder
          shadow="sm"
          radius="md"
          style={{ transition: "transform 150ms ease" }}
          onMouseEnter={(e) => ((e.currentTarget.style.transform = "translateY(-2px)"))}
          onMouseLeave={(e) => ((e.currentTarget.style.transform = "translateY(0)"))}
        >
          {category.image && category.image.trim() !== "" ? (
            <CardSection>
              <Image src={category.image} alt={category.title} height={280} fit="cover" />
            </CardSection>
          ) : (
            <CardSection>
              <Center style={{ height: 140, background: "var(--mantine-color-rose-1)" }}>
                <Group gap="xs">
                  <ThemeIcon color="rose" variant="light" radius="xl" size={36}>
                    <span style={{ fontSize: 18 }}>🗂️</span>
                  </ThemeIcon>
                  <Text fw={600} size="lg">
                    {capitalizeTexts(category.title)}
                  </Text>
                </Group>
              </Center>
            </CardSection>
          )}
          <Group justify="space-between" mt="md" mb="xs">
            <Text fw={600} size="lg">
              {capitalizeTexts(category.title)}
            </Text>
          </Group>
          <Text size="sm" c="dimmed">
            Explorá productos de esta categoría
          </Text>
          <Group mt="md">
            <Button variant="light" color="rose">
              Ver más
            </Button>
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
}