'use client';

import { Modal, Form, Input, InputNumber, Switch } from 'antd';
import { useEffect } from 'react';
import { Category } from '@/types/api';
import { useI18n } from '@/lib/i18n/I18nContext';

export interface CategoryFormValues {
  name: string;
  sortOrder: number;
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

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          sortOrder: initialValues.sortOrder,
          isVisible: initialValues.isVisible,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ isVisible: true, sortOrder: 0 });
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
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label={t.categories.name}
          rules={[{ required: true, message: t.categories.requireName }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="sortOrder"
          label={t.categories.sortOrder}
          rules={[{ required: true, message: t.categories.required }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="isVisible" label={t.categories.visible} valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
