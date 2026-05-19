'use client';

import { Modal, Form, Input, Switch, Grid } from 'antd';
import { useEffect } from 'react';
import { Category } from '@/types/api';
import { useI18n } from '@/lib/i18n/I18nContext';

export interface CategoryFormValues {
  name: string;
  sortOrder?: number;
  isVisible: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => void;
  initialValues?: Category | null;
  loading?: boolean;
}

export default function CategoryModal({ open, onClose, onSubmit, initialValues, loading }: Props) {
  const [form] = Form.useForm<CategoryFormValues>();
  const { t } = useI18n();
  const isEdit = !!initialValues;
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          isVisible: initialValues.isVisible,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ isVisible: true });
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
      title={isEdit ? t.categories.editTitle : t.categories.addTitle}
      onOk={handleOk}
      onCancel={onClose}
      okText={t.common.save}
      cancelText={t.common.cancel}
      confirmLoading={loading}
      destroyOnClose
      width={isMobile ? '100%' : undefined}
      style={isMobile ? { top: 0, margin: 0, maxWidth: '100vw', padding: 0 } : undefined}
      styles={isMobile ? { body: { maxHeight: '75vh', overflowY: 'auto' } } : undefined}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label={t.categories.name}
          rules={[{ required: true, message: t.categories.requireName }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="isVisible" label={t.categories.visible} valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
