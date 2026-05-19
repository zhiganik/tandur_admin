'use client';

import { useState, useMemo } from 'react';
import { Table, Button, Popconfirm, Typography, App, Spin, Input, Select, Space, Tag } from 'antd';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useUsers, useDeleteUser } from '@/lib/hooks/useUsers';
import { useI18n } from '@/lib/i18n/I18nContext';
import { User } from '@/types/api';

const { Title } = Typography;

const ROLE_COLORS: Record<string, string> = {
  Admin: 'red',
  User: 'blue',
};

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const { data, isLoading } = useUsers(page);
  const deleteUser = useDeleteUser();
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
      title: t.users.createdAt,
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleDateString('en-GB'),
      responsive: ['lg'] as Breakpoint[],
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_: unknown, r: User) => (
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
    </div>
  );
}
