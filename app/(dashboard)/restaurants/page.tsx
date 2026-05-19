'use client';

import { Table, Button, Popconfirm, Typography, Switch, Space, App, Spin } from 'antd';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';
import { PlusOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useRestaurants,
  useCreateRestaurant,
  useUpdateRestaurant,
  usePatchRestaurant,
  useDeleteRestaurant,
} from '@/lib/hooks/useRestaurants';
import { useMe } from '@/lib/hooks/useMe';
import RestaurantModal, { RestaurantFormValues } from '@/components/restaurants/RestaurantModal';
import { useI18n } from '@/lib/i18n/I18nContext';
import { Restaurant } from '@/types/api';

const { Title } = Typography;

export default function RestaurantsPage() {
  const router = useRouter();
  const { data, isLoading } = useRestaurants();
  const createRestaurant = useCreateRestaurant();
  const updateRestaurant = useUpdateRestaurant();
  const patchRestaurant = usePatchRestaurant();
  const deleteRestaurant = useDeleteRestaurant();
  const { data: me } = useMe();
  const isSuperAdmin = me?.roles.includes('SuperAdmin') ?? false;
  const { message } = App.useApp();
  const { t } = useI18n();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Restaurant | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleSubmit = async (values: RestaurantFormValues) => {
    setSubmitLoading(true);
    try {
      if (editingItem) {
        const { isActive, ...restValues } = values;
        const ops: Promise<unknown>[] = [updateRestaurant.mutateAsync({ id: editingItem.id, data: restValues })];
        if (isActive !== undefined && isActive !== editingItem.isActive) {
          ops.push(patchRestaurant.mutateAsync({ id: editingItem.id, isActive }));
        }
        await Promise.all(ops);
      } else {
        await createRestaurant.mutateAsync(values);
      }
      message.success(t.restaurants.saveSuccess);
      setModalOpen(false);
      setEditingItem(null);
    } catch {
      message.error(t.restaurants.saveFailed);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRestaurant.mutateAsync(id);
      message.success(t.restaurants.deleteSuccess);
    } catch {
      message.error(t.restaurants.deleteFailed);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    setTogglingId(id);
    try {
      await patchRestaurant.mutateAsync({ id, isActive });
    } catch {
      message.error(t.restaurants.statusFailed);
    } finally {
      setTogglingId(null);
    }
  };

  const columns = [
    { title: t.restaurants.name, dataIndex: 'name', key: 'name' },
    { title: t.restaurants.address, dataIndex: 'address', key: 'address', responsive: ['md'] as Breakpoint[] },
    {
      title: t.restaurants.active,
      key: 'isActive',
      width: 100,
      render: (_: unknown, r: Restaurant) => (
        <Switch
          checked={r.isActive}
          loading={togglingId === r.id}
          disabled={!isSuperAdmin}
          onChange={(checked) => isSuperAdmin && handleToggleActive(r.id, checked)}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 140,
      render: (_: unknown, r: Restaurant) => (
        <Space>
          <Button
            icon={<UnorderedListOutlined />}
            type="text"
            onClick={() => router.push(`/restaurants/${r.id}/categories`)}
          />
          <Button
            icon={<EditOutlined />}
            type="text"
            onClick={() => { setEditingItem(r); setModalOpen(true); }}
          />
          {isSuperAdmin && (
            <Popconfirm
              title={t.restaurants.deleteConfirm}
              onConfirm={() => handleDelete(r.id)}
              okText={t.common.yes}
              cancelText={t.common.no}
            >
              <Button
                icon={<DeleteOutlined />}
                danger
                type="text"
                loading={deleteRestaurant.isPending && deleteRestaurant.variables === r.id}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>{t.restaurants.title}</Title>
        {isSuperAdmin && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditingItem(null); setModalOpen(true); }}
          >
            {t.restaurants.addButton}
          </Button>
        )}
      </div>
      <Table
        rowKey="id"
        dataSource={data ?? []}
        columns={columns}
        scroll={{ x: true }}
        pagination={false}
      />
      <RestaurantModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        onSubmit={handleSubmit}
        initialValues={editingItem}
        loading={submitLoading}
      />
    </div>
  );
}
