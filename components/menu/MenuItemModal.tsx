'use client';

import { Modal, Form, Input, InputNumber, Switch, Select, Grid } from 'antd';
import { useEffect } from 'react';
import { MenuItem, Category } from '@/types/api';
import { useI18n } from '@/lib/i18n/I18nContext';

export interface MenuItemFormValues {
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  price: number;
  currency?: string | null;
  categoryId: string;
  sortOrder: number;
  isAvailable: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: MenuItemFormValues) => void;
  initialValues?: MenuItem | null;
  defaultCategoryId?: string | null;
  categories: Category[];
  loading?: boolean;
}

export default function MenuItemModal({ open, onClose, onSubmit, initialValues, defaultCategoryId, categories, loading }: Props) {
  const [form] = Form.useForm<MenuItemFormValues>();
  const { t } = useI18n();
  const isEdit = !!initialValues;
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          description: initialValues.description,
          shortDescription: initialValues.shortDescription,
          price: initialValues.price,
          currency: initialValues.currency,
          categoryId: initialValues.categoryId,
          sortOrder: initialValues.sortOrder,
          isAvailable: initialValues.isAvailable,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ isAvailable: true, sortOrder: 0, currency: 'UAH', ...(defaultCategoryId ? { categoryId: defaultCategoryId } : {}) });
      }
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit(values);
  };

  return (
    <Modal
      open={open}
      title={isEdit ? t.menu.editTitle : t.menu.addTitle}
      onOk={handleOk}
      onCancel={onClose}
      okText={t.common.save}
      cancelText={t.common.cancel}
      confirmLoading={loading}
      destroyOnClose
      width={isMobile ? '100%' : 560}
      style={isMobile ? { top: 0, margin: 0, maxWidth: '100vw', padding: 0 } : undefined}
      styles={isMobile ? { body: { maxHeight: '75vh', overflowY: 'auto' } } : undefined}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label={t.menu.name}
          rules={[{ required: true, message: t.menu.requireName }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="shortDescription" label={t.menu.shortDescription}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label={t.menu.description}>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          name="categoryId"
          label={t.menu.category}
          rules={[{ required: true, message: t.menu.requireCategory }]}
        >
          <Select
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder={t.menu.requireCategory}
          />
        </Form.Item>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
          <Form.Item
            name="price"
            label={t.menu.price}
            rules={[{ required: true, message: t.menu.requirePrice }]}
            style={{ flex: isMobile ? undefined : 1 }}
          >
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="currency" label={t.menu.currency} style={{ width: isMobile ? '100%' : 100 }}>
            <Input />
          </Form.Item>
          <Form.Item name="sortOrder" label={t.menu.sortOrder} style={{ width: isMobile ? '100%' : 100 }}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </div>
        <Form.Item name="isAvailable" label={t.menu.available} valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
