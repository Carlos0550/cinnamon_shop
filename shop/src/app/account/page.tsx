"use client";
import { useGetProfile, useUpdateProfile, useUploadAvatar } from '@/Api/useProfile';
import { useAppContext } from '@/providers/AppContext';
import { Avatar, Button, Grid, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { PasswordInput } from '@mantine/core';
import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { showNotification } from '@mantine/notifications';

export default function AccountPage() {
  const { auth, utils } = useAppContext();
  const router = useRouter();
  useEffect(() => {
    if (!auth.isAuthenticated) {
      showNotification({ message: 'Debes iniciar sesión para acceder a esta página', color: 'red', id: 'account-page' });
      router.push('/');
    }
  }, [auth.isAuthenticated, router]);
  const { data } = useGetProfile();
  const update = useUpdateProfile();
  const upload = useUploadAvatar();
  const [form, setForm] = useState({ name: '', phone: '', shipping_street: '', shipping_postal_code: '', shipping_city: '', shipping_province: '' });

  useEffect(() => {
    const u = data?.user;
    if (u) {
      setTimeout(() => {
        setForm({
          name: u.name || '',
          phone: u.phone || '',
          shipping_street: u.shipping_street || '',
          shipping_postal_code: u.shipping_postal_code || '',
          shipping_city: u.shipping_city || '',
          shipping_province: u.shipping_province || '',
        });
      }, 0);
    }
  }, [data?.user]);

  const onChange = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => setForm(s => ({ ...s, [k]: e.target.value }));
  const onSave = async () => {
    await update.mutateAsync(form);
  };
  const onAvatar = async (file?: File | null) => {
    if (file) await upload.mutateAsync(file);
  };
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [changing, setChanging] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const onChangePassword = async () => {
    setChangeError(null);
    if (!oldPass || !newPass || !confirmNew) { setChangeError('Completa todos los campos'); return; }
    if (newPass !== confirmNew) { setChangeError('La nueva contraseña no coincide'); return; }
    setChanging(true);
    try {
      const res = await fetch(`${utils.baseUrl}/shop/password/change`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.state.token}` }, body: JSON.stringify({ old_password: oldPass, new_password: newPass }) });
      if (!res.ok) {
        const err: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'change_failed');
      }
      setOldPass(''); setNewPass(''); setConfirmNew('');
    } catch (e) {
      const er = e as Error; setChangeError(er.message || 'Error al cambiar contraseña');
    } finally { setChanging(false); }
  }

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
      <Stack>
        <Title order={4}>Cambiar contraseña</Title>
        <PasswordInput label="Contraseña actual" value={oldPass} onChange={(e) => setOldPass(e.currentTarget.value)} />
        <PasswordInput label="Nueva contraseña" value={newPass} onChange={(e) => setNewPass(e.currentTarget.value)} />
        <PasswordInput label="Confirmar nueva" value={confirmNew} onChange={(e) => setConfirmNew(e.currentTarget.value)} />
        {changeError && <Text c="red">{changeError}</Text>}
        <Group>
          <Button color="green" onClick={onChangePassword} loading={changing}>Actualizar contraseña</Button>
        </Group>
      </Stack>
    </Stack>
  );
}
