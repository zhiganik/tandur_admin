'use client';

import { useState, useMemo } from 'react';
import { Table, Button, Popconfirm, Typography, App, Spin, Input, Select, Space, Tag, Drawer, Popover } from 'antd';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';
import { DeleteOutlined, SearchOutlined, KeyOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useUsers, useDeleteUser, useAssignRestaurant, useUnassignRestaurant, useResetAdminPassword } from '@/lib/hooks/useUsers';
import { useAllRestaurants } from '@/lib/hooks/useRestaurants';
import { useMe } from '@/lib/hooks/useMe';
import { useI18n } from '@/lib/i18n/I18nContext';
import { User, RestaurantRef } from '@/types/api';

const { Title } = Typography;

const ROLE_COLORS: Record<string, string> = {
  Admin: 'red',
  User: 'blue',
  SuperAdmin: 'purple',
};

function RestaurantsCell({ user, isSuperAdmin }: { user: User; isSuperAdmin: boolean }) {
  const { t } = useI18n();
  const { message } = App.useApp();
  const assignRestaurant = useAssignRestaurant();
  const unassignRestaurant = useUnassignRestaurant();
  const { data: allRestaurants } = useAllRestaurants();

  const isAdmin = user.roles.includes('Admin');
  if (!isSuperAdmin || !isAdmin) {
    if (!user.restaurants?.length) return <span style={{ color: 'rgba(0,0,0,0.25)' }}>—</span>;
    return (
      <Space size={4} wrap>
        {user.restaurants.map((r) => (
          <Tag key={r.id} style={{ margin: 0 }}>{r.name}</Tag>
        ))}
      </Space>
    );
  }

  const assignedIds = new Set(user.restaurants?.map((r) => r.id) ?? []);
  const available = allRestaurants?.data?.filter((r) => !assignedIds.has(r.id)) ?? [];

  const handleUnassign = async (r: RestaurantRef) => {
    try {
      await unassignRestaurant.mutateAsync({ adminId: user.id, restaurantId: r.id });
      message.success(t.users.unassignSuccess);
    } catch {
      message.error(t.users.unassignFailed);
    }
  };

  const handleAssign = async (restaurantId: string) => {
    try {
      await assignRestaurant.mutateAsync({ adminId: user.id, restaurantId });
      message.success(t.users.assignSuccess);
    } catch {
      message.error(t.users.assignFailed);
    }
  };

  return (
    <Space size={4} wrap>
      {user.restaurants?.map((r) => (
        <Tag
          key={r.id}
          closable
          onClose={(e) => { e.preventDefault(); handleUnassign(r); }}
          style={{ margin: 0 }}
        >
          {r.name}
        </Tag>
      ))}
      {available.length > 0 && (
        <Popover
          trigger="click"
          content={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
              {available.map((r) => (
                <Button
                  key={r.id}
                  type="text"
                  size="small"
                  style={{ textAlign: 'left' }}
                  loading={assignRestaurant.isPending && (assignRestaurant.variables as { adminId: string; restaurantId: string })?.restaurantId === r.id}
                  onClick={() => handleAssign(r.id)}
                >
                  {r.name}
                </Button>
              ))}
            </div>
          }
        >
          <Button size="small" icon={<PlusOutlined />} type="dashed" />
        </Popover>
      )}
    </Space>
  );
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [drawerUser, setDrawerUser] = useState<User | null>(null);
  const { data, isLoading } = useUsers(page);
  const deleteUser = useDeleteUser();
  const resetPassword = useResetAdminPassword();
  const { data: me } = useMe();
  const isSuperAdmin = me?.roles.includes('SuperAdmin') ?? false;
  const { message } = App.useApp();
  const { t } = useI18n();

  const allRoles = useMemo(() => {
    if (!data?.data) return [];
    const set = new Set<string>();
    data.data.forEach((u) => u.roles.forEach((r) => set.add(r)));
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data?.data) return [];
    const q = search.trim().toLowerCase();
    return data.data.filter((u) => {
      if (roleFilter && !u.roles.includes(roleFilter)) return false;
      if (!q) return true;
      const name = [u.firstName, u.lastName].filter(Boolean).join(' ').toLowerCase();
      return (
        name.includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    });
  }, [data, search, roleFilter]);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleRole = (v: string | null) => { setRoleFilter(v); setPage(1); };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser.mutateAsync(id);
      message.success(t.users.deleteSuccess);
    } catch {
      message.error(t.users.deleteFailed);
    }
  };

  const handleResetPassword = async (id: string) => {
    try {
      await resetPassword.mutateAsync(id);
      message.success(t.users.resetPasswordSuccess);
    } catch {
      message.error(t.users.resetPasswordFailed);
    }
  };

  const columns = [
    {
      title: t.users.id,
      dataIndex: 'id',
      key: 'id',
      render: (v: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>
          {v.slice(0, 8)}…
        </span>
      ),
      responsive: ['xl'] as Breakpoint[],
    },
    {
      title: t.users.name,
      key: 'name',
      render: (_: unknown, r: User) =>
        [r.firstName, r.lastName].filter(Boolean).join(' ') || '—',
    },
    {
      title: t.users.email,
      dataIndex: 'email',
      key: 'email',
      render: (v: string | null) => v || '—',
      responsive: ['md'] as Breakpoint[],
    },
    {
      title: t.users.phone,
      dataIndex: 'phone',
      key: 'phone',
      render: (v: string | null) => v || '—',
      responsive: ['sm'] as Breakpoint[],
    },
    {
      title: t.users.dateOfBirth,
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (v: string | null) => v ? new Date(v).toLocaleDateString('en-GB') : '—',
      responsive: ['lg'] as Breakpoint[],
    },
    {
      title: t.users.role,
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => (
        <>
          {roles.map((r) => (
            <Tag key={r} color={ROLE_COLORS[r] ?? 'default'}>{r}</Tag>
          ))}
        </>
      ),
      responsive: ['sm'] as Breakpoint[],
    },
    {
      title: t.users.restaurants,
      key: 'restaurants',
      render: (_: unknown, r: User) => (
        <RestaurantsCell user={r} isSuperAdmin={isSuperAdmin} />
      ),
      responsive: ['lg'] as Breakpoint[],
    },
    {
      title: t.users.createdAt,
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleDateString('en-GB'),
      responsive: ['lg'] as Breakpoint[],
    },
    {
      title: '',
      key: 'actions',
      width: isSuperAdmin ? 100 : 60,
      render: (_: unknown, r: User) => (
        <Space size={4}>
          {isSuperAdmin && r.roles.includes('Admin') && (
            <Popconfirm
              title={t.users.resetPasswordConfirm}
              onConfirm={() => handleResetPassword(r.id)}
              okText={t.common.yes}
              cancelText={t.common.no}
            >
              <Button
                icon={<KeyOutlined />}
                type="text"
                loading={resetPassword.isPending && resetPassword.variables === r.id}
              />
            </Popconfirm>
          )}
          {isSuperAdmin && (
            <Popconfirm
              title={t.users.deleteConfirm}
              onConfirm={() => handleDelete(r.id)}
              okText={t.common.yes}
              cancelText={t.common.no}
            >
              <Button
                icon={<DeleteOutlined />}
                danger
                type="text"
                loading={deleteUser.isPending && deleteUser.variables === r.id}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>{t.users.title}</Title>
      <Space wrap style={{ marginBottom: 16, width: '100%' }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder={t.users.searchPlaceholder}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          style={{ width: 260 }}
        />
        {allRoles.length > 0 && (
          <Select
            value={roleFilter}
            onChange={handleRole}
            allowClear
            placeholder={t.users.filterRole}
            style={{ width: 160 }}
            options={allRoles.map((r) => ({ value: r, label: r }))}
          />
        )}
      </Space>
      <Table
        rowKey="id"
        dataSource={filtered}
        columns={columns}
        scroll={{ x: true }}
        pagination={{
          current: page,
          pageSize: 20,
          total: search || roleFilter ? filtered.length : data?.total,
          onChange: (p) => setPage(p),
          showTotal: (total) => `${t.common.total}: ${total}`,
        }}
      />
      <Drawer
        open={!!drawerUser}
        onClose={() => setDrawerUser(null)}
        title={drawerUser ? [drawerUser.firstName, drawerUser.lastName].filter(Boolean).join(' ') || drawerUser.email : ''}
        width={360}
      >
        {drawerUser && (
          <div>
            <p>{drawerUser.email}</p>
          </div>
        )}
      </Drawer>
    </div>
  );
}
