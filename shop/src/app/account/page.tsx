"use client";
import { useGetProfile, useUpdateProfile, useUploadAvatar } from '@/Api/useProfile';
import { useAppContext } from '@/providers/AppContext';
import { Avatar, Button, Grid, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { useEffect, useState } from 'react';

export default function AccountPage() {
  const { auth } = useAppContext();
  const { data } = useGetProfile();
  const update = useUpdateProfile();
  const upload = useUploadAvatar();
  const [form, setForm] = useState({ name: '', phone: '', shipping_street: '', shipping_postal_code: '', shipping_city: '', shipping_province: '' });

  useEffect(() => {
    const u = data?.user;
    if (u) {
      setForm({
        name: u.name || '',
        phone: u.phone || '',
        shipping_street: u.shipping_street || '',
        shipping_postal_code: u.shipping_postal_code || '',
        shipping_city: u.shipping_city || '',
        shipping_province: u.shipping_province || '',
      });
    }
  }, [data?.user]);

  const onChange = (k: keyof typeof form) => (e: any) => setForm(s => ({ ...s, [k]: e.target.value }));
  const onSave = async () => {
    await update.mutateAsync(form);
  };
  const onAvatar = async (file?: File | null) => {
    if (file) await upload.mutateAsync(file);
  };

  const profileImage = data?.user?.profile_image || auth.state.user?.profileImage || '';
  const email = data?.user?.email || auth.state.user?.email || '';

  return (
    <Stack>
      <Title order={2}>Mi cuenta</Title>
      <Group>
        <Avatar src={profileImage} alt={form.name || email} radius="xl" size={80} />
        <Stack>
          <Text>{email}</Text>
          <input type="file" accept="image/*" onChange={e => onAvatar(e.target.files?.[0] || null)} />
        </Stack>
      </Group>
      <Grid>
        <Grid.Col span={12}><TextInput label="Nombre" value={form.name} onChange={onChange('name')} /></Grid.Col>
        <Grid.Col span={12}><TextInput label="Teléfono" value={form.phone} onChange={onChange('phone')} /></Grid.Col>
        <Grid.Col span={12}><TextInput label="Calle" value={form.shipping_street} onChange={onChange('shipping_street')} /></Grid.Col>
        <Grid.Col span={12}><TextInput label="Código postal" value={form.shipping_postal_code} onChange={onChange('shipping_postal_code')} /></Grid.Col>
        <Grid.Col span={12}><TextInput label="Ciudad" value={form.shipping_city} onChange={onChange('shipping_city')} /></Grid.Col>
        <Grid.Col span={12}><TextInput label="Provincia" value={form.shipping_province} onChange={onChange('shipping_province')} /></Grid.Col>
      </Grid>
      <Button onClick={onSave} loading={update.isPending}>Guardar cambios</Button>
    </Stack>
  );
}

