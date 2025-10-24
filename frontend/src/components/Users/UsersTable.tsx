import { useEffect, useState } from "react";
import { useGetUsers } from "../Api/AuthApi";
import { Box, Table, Flex, Text, Group, Button, Badge } from "@mantine/core";

type Users = {
    id: string,
    name: string,
    email: string,
    role: number
}

export function UsersTable({
    search
}: { search: string }) {
    const [users, setUsers] = useState<Users[]>([]);
    const [pagination, setPagination] = useState<{
        total: number,
        page: number,
        limit: number,
        totalPages: number,
        hasNextPage: boolean,
        hasPrevPage: boolean,
    }>({
        total: 0,
        page: 0,
        limit: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
    })

    const [currentPage, setCurrentPage] = useState(1);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setPagination({
            ...pagination,
            page,
        })
    }
    const { data, isLoading } = useGetUsers(currentPage, pagination.limit || 10, search);


    useEffect(() => {
        if (isLoading) return;
        setUsers(data?.users || []);
        setPagination({
            ...pagination,
            total: data?.pagination?.total || 0,
            totalPages: data?.pagination?.totalPages || 0,
            page: data?.pagination?.page || currentPage,
            limit: data?.pagination?.limit || 10,
            hasNextPage: data?.pagination?.hasNextPage || false,
            hasPrevPage: data?.pagination?.hasPrevPage || false,
        })
    },[isLoading, data])

    const capitalizeNames = (names: string) => {
        return names.split(' ').map((name) => name.charAt(0).toUpperCase() + name.slice(1)).join(' ');
    }

    const renderBadgeByRole = (role: number) => {
        if(role == 1){
            return <Badge color="green">Administrador</Badge>
        }else{
            return <Badge color="blue">Usuario</Badge>
        }
    }
  return (
    <Box>
        <Table
             striped
            highlightOnHover
            withTableBorder
            withColumnBorders
            withRowBorders
            horizontalSpacing="md"
            verticalSpacing="sm"
            stickyHeader
            stickyHeaderOffset={60}
            captionSide="bottom"
            tabularNums
        >
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Nombre</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Rol</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {users.map((user) => (
                    <Table.Tr key={user.id}>
                        <Table.Td>{capitalizeNames(user.name)}</Table.Td>
                        <Table.Td>{user.email}</Table.Td>
                        <Table.Td>{renderBadgeByRole(user.role)}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>

        {pagination && pagination.totalPages > 1 && (
            <Flex justify="center" mt="md" gap="md">
                <Text>
                    Página {pagination.page} de {pagination.totalPages} ({pagination.total} usuarios)
                </Text>
                <Group gap="xs">
                    <Button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrevPage}
                        size="sm"
                    >
                        Anterior
                    </Button>
                    <Button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        size="sm"
                    >
                        Siguiente
                    </Button>
                </Group>
            </Flex>
        )}
    </Box>
  )
}

