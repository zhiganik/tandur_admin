'use client';

import { useState, useRef } from 'react';
import { Table, Button, Popconfirm, Typography, App, Spin, Input, Space, Tag, Drawer, Popover } from 'antd';
import type { InputRef } from 'antd';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { DeleteOutlined, SearchOutlined, MailOutlined, PlusOutlined } from '@ant-design/icons';
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

  // SuperAdmin users always have access to all restaurants — show "All" instead of list
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

// Column search dropdown component
function ColumnSearchFilter({ confirm, clearFilters, selectedKeys, setSelectedKeys, placeholder }: FilterDropdownProps & { placeholder: string }) {
  const inputRef = useRef<InputRef>(null);
  return (
    <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={selectedKeys[0] as string}
        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => confirm()}
        style={{ marginBottom: 8, display: 'block' }}
        autoFocus
      />
      <Space>
        <Button
          type="primary"
          onClick={() => confirm()}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90 }}
        >
          Search
        </Button>
        <Button
          onClick={() => { clearFilters?.(); confirm(); }}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </Space>
    </div>
  );
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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
      filterDropdown: (props: FilterDropdownProps) => (
        <ColumnSearchFilter {...props} placeholder={t.users.email} />
      ),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
      ),
      onFilter: () => true, // server-side
      filteredValue: search && !search.includes(' ') ? [search] : null,
      onFilterDropdownOpenChange: (open: boolean) => {
        if (!open && search) return;
      },
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
      filters: ALL_ROLES.map((r) => ({ text: r, value: r })),
      filteredValue: roleFilter.length ? roleFilter : null,
      onFilter: () => true, // server-side
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
      sorter: true,
      sortOrder: sortOrder === 'asc' ? ('ascend' as const) : ('descend' as const),
      showSorterTooltip: false,
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

  if (isLoading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>{t.users.title}</Title>
      <Table
        rowKey="id"
        dataSource={data?.data ?? []}
        columns={columns}
        scroll={{ x: true }}
        loading={isLoading}
        onChange={(_pagination, filters, sorter) => {
          // Search filter (email column)
          const emailFilter = filters['email'];
          if (emailFilter !== undefined) {
            setSearch((emailFilter?.[0] as string) ?? '');
            setPage(1);
          }

          // Role filter
          const roleFilters = filters['roles'];
          if (roleFilters !== undefined) {
            setRoleFilter((roleFilters as string[]) ?? []);
            setPage(1);
          }

          // Sort
          if (!Array.isArray(sorter) && sorter.field === 'createdAt') {
            setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
            setPage(1);
          }
        }}
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
