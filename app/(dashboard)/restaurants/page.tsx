'use client';

import { Table, Button, Popconfirm, Typography, Switch, Space, App, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState } from 'react';
import {
  useRestaurants,
  useCreateRestaurant,
  useUpdateRestaurant,
  usePatchRestaurant,
  useDeleteRestaurant,
} from '@/lib/hooks/useRestaurants';
import RestaurantModal, { RestaurantFormValues } from '@/components/restaurants/RestaurantModal';
import { useI18n } from '@/lib/i18n/I18nContext';
import { Restaurant } from '@/types/api';

const { Title } = Typography;

export default function RestaurantsPage() {
  const { data, isLoading } = useRestaurants();
  const createRestaurant = useCreateRestaurant();
  const updateRestaurant = useUpdateRestaurant();
  const patchRestaurant = usePatchRestaurant();
  const deleteRestaurant = useDeleteRestaurant();
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
        await updateRestaurant.mutateAsync({ id: editingItem.id, data: values });
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
    { title: t.restaurants.address, dataIndex: 'address', key: 'address' },
    {
      title: t.restaurants.hours,
      key: 'hours',
      render: (_: unknown, r: Restaurant) =>
        `${r.openTime?.slice(0, 5)} — ${r.closeTime?.slice(0, 5)}`,
    },
    {
      title: t.restaurants.active,
      key: 'isActive',
      width: 100,
      render: (_: unknown, r: Restaurant) => (
        <Switch
          checked={r.isActive}
          loading={togglingId === r.id}
          onChange={(checked) => handleToggleActive(r.id, checked)}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_: unknown, r: Restaurant) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="text"
            onClick={() => { setEditingItem(r); setModalOpen(true); }}
          />
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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingItem(null); setModalOpen(true); }}
        >
          {t.restaurants.addButton}
        </Button>
      </div>
      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        pagination={{ pageSize: 20, showTotal: (total) => `${t.common.total}: ${total}` }}
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
