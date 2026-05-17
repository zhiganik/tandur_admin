'use client';

import { Table, Button, Popconfirm, Typography, App, Spin } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useUsers, useDeleteUser } from '@/lib/hooks/useUsers';
import { useI18n } from '@/lib/i18n/I18nContext';
import { User } from '@/types/api';

const { Title } = Typography;

export default function UsersPage() {
  const { data, isLoading } = useUsers();
  const deleteUser = useDeleteUser();
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

  const columns = [
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
    },
    {
      title: t.users.phone,
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (v: string | null) => v || '—',
    },
    {
      title: t.users.createdAt,
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleDateString('en-GB'),
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
      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        pagination={{ pageSize: 20, showTotal: (total) => `${t.common.total}: ${total}` }}
      />
    </div>
  );
}
