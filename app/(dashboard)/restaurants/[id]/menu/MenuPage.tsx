'use client';

import { Table, Button, Popconfirm, Typography, Switch, Space, App, Spin, Tag } from 'antd';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { menuApi } from '@/lib/api/menu';
import { useCreateMenuItem, useUpdateMenuItem, usePatchMenuItem, useDeleteMenuItem } from '@/lib/hooks/useMenu';
import MenuItemModal, { MenuItemFormValues } from '@/components/menu/MenuItemModal';
import { useI18n } from '@/lib/i18n/I18nContext';
import { MenuItem } from '@/types/api';

const { Title } = Typography;

export default function MenuPage() {
  const { id: restaurantId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: menuData, isLoading } = useQuery({
    queryKey: ['full-menu', restaurantId],
    queryFn: () => menuApi.getFullMenu(restaurantId),
    enabled: !!restaurantId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['full-menu', restaurantId] });

  const createMenuItem = useCreateMenuItem(restaurantId);
  const updateMenuItem = useUpdateMenuItem(restaurantId);
  const patchMenuItem = usePatchMenuItem(restaurantId);
  const deleteMenuItem = useDeleteMenuItem(restaurantId);
  const { message } = App.useApp();
  const { t } = useI18n();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const categories = menuData?.categories ?? [];
  const allItems = menuData?.items ?? [];

  const filterCategoryId = searchParams.get('category');
  const displayItems = filterCategoryId
    ? allItems.filter((i) => i.categoryId === filterCategoryId)
    : allItems;

  const handleSubmit = async (values: MenuItemFormValues) => {
    setSubmitLoading(true);
    try {
      if (editingItem) {
        await updateMenuItem.mutateAsync({ id: editingItem.id, data: values });
      } else {
        await createMenuItem.mutateAsync({ ...values, restaurantId });
      }
      invalidate();
      message.success(t.menu.saveSuccess);
      setModalOpen(false);
      setEditingItem(null);
    } catch {
      message.error(t.menu.saveFailed);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMenuItem.mutateAsync(id);
      invalidate();
      message.success(t.menu.deleteSuccess);
    } catch {
      message.error(t.menu.deleteFailed);
    }
  };

  const handleToggleAvailable = async (id: string, isAvailable: boolean) => {
    setTogglingId(id);
    try {
      await patchMenuItem.mutateAsync({ id, data: { isAvailable } });
      invalidate();
    } catch {
      message.error(t.menu.availabilityFailed);
    } finally {
      setTogglingId(null);
    }
  };

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? '—';

  const columns = [
    { title: t.menu.name, dataIndex: 'name', key: 'name' },
    {
      title: t.menu.category,
      key: 'categoryId',
      render: (_: unknown, r: MenuItem) => categoryName(r.categoryId),
      responsive: ['md'] as Breakpoint[],
    },
    {
      title: t.menu.price,
      key: 'price',
      width: 120,
      render: (_: unknown, r: MenuItem) => r.price.toFixed(2),
      responsive: ['sm'] as Breakpoint[],
    },
    {
      title: t.menu.available,
      key: 'isAvailable',
      width: 110,
      render: (_: unknown, r: MenuItem) => (
        <Switch
          checked={r.isAvailable}
          loading={togglingId === r.id}
          onChange={(checked) => handleToggleAvailable(r.id, checked)}
        />
      ),
    },
    {
      title: '',
      key: 'isActive',
      width: 80,
      render: (_: unknown, r: MenuItem) =>
        !r.isActive ? <Tag color="red">Inactive</Tag> : null,
      responsive: ['sm'] as Breakpoint[],
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_: unknown, r: MenuItem) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="text"
            onClick={() => { setEditingItem(r); setModalOpen(true); }}
          />
          <Popconfirm
            title={t.menu.deleteConfirm}
            onConfirm={() => handleDelete(r.id)}
            okText={t.common.yes}
            cancelText={t.common.no}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              type="text"
              loading={deleteMenuItem.isPending && deleteMenuItem.variables === r.id}
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
        <Space>
          <Button onClick={() => router.back()}>{t.common.back}</Button>
          <Title level={4} style={{ margin: 0 }}>
            {t.menu.title}
            {filterCategoryId && (
              <span style={{ fontWeight: 400, fontSize: 14, marginLeft: 8, color: '#888' }}>
                — {categoryName(filterCategoryId)}
              </span>
            )}
          </Title>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingItem(null); setModalOpen(true); }}
        >
          {t.menu.addButton}
        </Button>
      </div>
      <Table
        rowKey="id"
        dataSource={displayItems}
        columns={columns}
        scroll={{ x: true }}
        pagination={false}
      />
      <MenuItemModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        onSubmit={handleSubmit}
        initialValues={editingItem}
        categories={categories}
        loading={submitLoading}
      />
    </div>
  );
}
