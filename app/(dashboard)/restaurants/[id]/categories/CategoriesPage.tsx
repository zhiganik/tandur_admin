'use client';

import { Table, Button, Popconfirm, Typography, Switch, Space, App, Spin } from 'antd';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';
import { PlusOutlined, EditOutlined, DeleteOutlined, MenuOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  usePatchCategory,
  useDeleteCategory,
} from '@/lib/hooks/useCategories';
import CategoryModal, { CategoryFormValues } from '@/components/categories/CategoryModal';
import { useI18n } from '@/lib/i18n/I18nContext';
import { Category } from '@/types/api';

const { Title } = Typography;

export default function CategoriesPage() {
  const { id: restaurantId } = useParams<{ id: string }>();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCategories(restaurantId, page);
  const createCategory = useCreateCategory(restaurantId);
  const updateCategory = useUpdateCategory(restaurantId);
  const patchCategory = usePatchCategory(restaurantId);
  const deleteCategory = useDeleteCategory(restaurantId);
  const { message } = App.useApp();
  const { t } = useI18n();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleSubmit = async (values: CategoryFormValues) => {
    setSubmitLoading(true);
    try {
      if (editingItem) {
        await updateCategory.mutateAsync({ id: editingItem.id, data: values });
      } else {
        await createCategory.mutateAsync(values);
      }
      message.success(t.categories.saveSuccess);
      setModalOpen(false);
      setEditingItem(null);
    } catch {
      message.error(t.categories.saveFailed);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      message.success(t.categories.deleteSuccess);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      message.error(status === 409 ? t.categories.deleteConflict : t.categories.deleteFailed);
    }
  };

  const handleToggleVisible = async (id: string, isVisible: boolean) => {
    setTogglingId(id);
    try {
      await patchCategory.mutateAsync({ id, data: { isVisible } });
    } catch {
      message.error(t.categories.statusFailed);
    } finally {
      setTogglingId(null);
    }
  };

  const columns = [
    { title: t.categories.name, dataIndex: 'name', key: 'name' },
    { title: t.categories.sortOrder, dataIndex: 'sortOrder', key: 'sortOrder', width: 100, responsive: ['sm'] as Breakpoint[] },
    {
      title: t.categories.visible,
      key: 'isVisible',
      width: 100,
      render: (_: unknown, r: Category) => (
        <Switch
          checked={r.isVisible}
          loading={togglingId === r.id}
          onChange={(checked) => handleToggleVisible(r.id, checked)}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_: unknown, r: Category) => (
        <Space>
          <Button
            icon={<MenuOutlined />}
            type="text"
            title={t.menu.title}
            onClick={() => router.push(`/restaurants/${restaurantId}/menu?category=${r.id}`)}
          />
          <Button
            icon={<EditOutlined />}
            type="text"
            onClick={() => { setEditingItem(r); setModalOpen(true); }}
          />
          <Popconfirm
            title={t.categories.deleteConfirm}
            onConfirm={() => handleDelete(r.id)}
            okText={t.common.yes}
            cancelText={t.common.no}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              type="text"
              loading={deleteCategory.isPending && deleteCategory.variables === r.id}
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
          <Title level={4} style={{ margin: 0 }}>{t.categories.title}</Title>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingItem(null); setModalOpen(true); }}
        >
          {t.categories.addButton}
        </Button>
      </div>
      <Table
        rowKey="id"
        dataSource={data?.data}
        columns={columns}
        scroll={{ x: true }}
        pagination={{
          current: page,
          pageSize: 20,
          total: data?.total,
          onChange: (p) => setPage(p),
          showTotal: (total) => `${t.common.total}: ${total}`,
        }}
      />
      <CategoryModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        onSubmit={handleSubmit}
        initialValues={editingItem}
        loading={submitLoading}
      />
    </div>
  );
}
