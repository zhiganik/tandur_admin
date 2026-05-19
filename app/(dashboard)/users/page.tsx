'use client';

import { useState, useCallback, useDeferredValue } from 'react';
import { Table, Button, Popconfirm, Typography, App, Input, Space, Tag, Drawer, Popover, Tooltip } from 'antd';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';
import type { SorterResult, FilterValue, TablePaginationConfig, TableCurrentDataSource } from 'antd/es/table/interface';
import { DeleteOutlined, SearchOutlined, MailOutlined, PlusOutlined, CopyOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
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

const ALL_ROLES = ['User', 'Admin', 'SuperAdmin'];

function RestaurantsCell({ user, isSuperAdmin }: { user: User; isSuperAdmin: boolean }) {
  const { t } = useI18n();
  const { message } = App.useApp();
  const assignRestaurant = useAssignRestaurant();
  const unassignRestaurant = useUnassignRestaurant();
  const { data: allRestaurants } = useAllRestaurants();

  const isAdmin = user.roles.includes('Admin');
  const isUserSuperAdmin = user.roles.includes('SuperAdmin');

  if (isUserSuperAdmin) {
    return <Tag color="purple">All</Tag>;
  }

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
  const available = allRestaurants?.filter((r) => !assignedIds.has(r.id)) ?? [];

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
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  // 'asc' | 'desc' — always controlled, no null to avoid uncontrolled cycling
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search via deferred value so keystrokes don't trigger immediate refetch
  const search = useDeferredValue(searchInput);

  const [drawerUser, setDrawerUser] = useState<User | null>(null);

  const { data, isLoading } = useUsers({
    page,
    limit: 20,
    search: search || undefined,
    role: roleFilter.length ? roleFilter : undefined,
    sort: sortOrder,
  });

  const deleteUser = useDeleteUser();
  const resetPassword = useResetAdminPassword();
  const { data: me } = useMe();
  const isSuperAdmin = me?.roles.includes('SuperAdmin') ?? false;
  const { message } = App.useApp();
  const { t } = useI18n();

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

  const handleCopyId = useCallback((id: string) => {
    navigator.clipboard.writeText(id);
  }, []);

  const handleTableChange = useCallback(
    (_pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, _sorter: SorterResult<User> | SorterResult<User>[], _extra: TableCurrentDataSource<User>) => { // eslint-disable-line @typescript-eslint/no-unused-vars
      // Role filter — only update if the role key is present in filters
      if ('role' in filters) {
        const newRoles = (filters['role'] as string[]) ?? [];
        setRoleFilter(newRoles);
        setPage(1);
      }
    },
    [],
  );

  const handleSortToggle = useCallback(() => {
    setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc');
    setPage(1);
  }, []);

  const columns = [
    {
      title: t.users.id,
      dataIndex: 'id',
      key: 'id',
      render: (v: string) => (
        <Space size={4}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>
            {v.slice(0, 8)}…
          </span>
          <Tooltip title="Copy ID">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)' }} />}
              style={{ padding: '0 2px', height: 18, minWidth: 18 }}
              onClick={() => handleCopyId(v)}
            />
          </Tooltip>
        </Space>
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
      title: t.users.role,
      dataIndex: 'roles',
      key: 'role',
      render: (roles: string[]) => (
        <>
          {roles.map((r) => (
            <Tag key={r} color={ROLE_COLORS[r] ?? 'default'}>{r}</Tag>
          ))}
        </>
      ),
      responsive: ['sm'] as Breakpoint[],
      filters: ALL_ROLES.map((r) => ({ text: r, value: r })),
      filteredValue: roleFilter.length ? roleFilter : null,
      onFilter: () => true,
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
      title: (
        <span
          onClick={handleSortToggle}
          style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
        >
          {t.users.createdAt}{' '}
          {sortOrder === 'asc'
            ? <ArrowUpOutlined style={{ fontSize: 11, color: '#1677ff' }} />
            : <ArrowDownOutlined style={{ fontSize: 11, color: '#1677ff' }} />}
        </span>
      ),
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
                icon={<MailOutlined />}
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

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>{t.users.title}</Title>
      <Input
        prefix={<SearchOutlined />}
        placeholder={t.users.searchPlaceholder}
        value={searchInput}
        onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
        allowClear
        style={{ width: 300, marginBottom: 16 }}
      />
      <Table
        rowKey="id"
        dataSource={data?.data ?? []}
        columns={columns}
        scroll={{ x: true }}
        loading={isLoading}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize: 20,
          total: data?.total,
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
