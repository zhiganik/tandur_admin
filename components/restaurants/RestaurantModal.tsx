'use client';

import { Modal, Form, Input, InputNumber, Switch, Select, Row, Col, Grid } from 'antd';
import { useEffect } from 'react';
import { Restaurant } from '@/types/api';
import { useI18n } from '@/lib/i18n/I18nContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: RestaurantFormValues) => Promise<void>;
  initialValues?: Restaurant | null;
  loading?: boolean;
}

const CURRENCIES = [
  'UAH', 'USD', 'EUR', 'GBP', 'KZT', 'RUB', 'PLN', 'CZK', 'TRY', 'GEL', 'AZN', 'AMD',
];

export interface RestaurantFormValues {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  currency: string;
  isActive?: boolean;
}

export default function RestaurantModal({ open, onClose, onSubmit, initialValues, loading }: Props) {
  const [form] = Form.useForm();
  const { t } = useI18n();
  const isEdit = !!initialValues;
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        address: initialValues.address,
        latitude: initialValues.latitude,
        longitude: initialValues.longitude,
        timeZone: initialValues.timeZone,
        currency: initialValues.currency,
        isActive: initialValues.isActive,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Modal
      title={isEdit ? t.restaurants.editTitle : t.restaurants.addTitle}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText={isEdit ? t.common.save : t.common.add}
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
          label={t.restaurants.name}
          rules={[{ required: true, message: t.restaurants.requireName }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="address"
          label={t.restaurants.address}
          rules={[{ required: true, message: t.restaurants.requireAddress }]}
        >
          <Input />
        </Form.Item>
        <Row gutter={12}>
          <Col span={isMobile ? 24 : 12}>
            <Form.Item
              name="latitude"
              label={t.restaurants.latitude}
              rules={[{ required: true, message: t.restaurants.required }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 12}>
            <Form.Item
              name="longitude"
              label={t.restaurants.longitude}
              rules={[{ required: true, message: t.restaurants.required }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="timeZone"
          label={t.restaurants.timezone}
          rules={[{ required: true, message: t.restaurants.requireTimezone }]}
        >
          <Input placeholder="America/New_York" />
        </Form.Item>
        <Form.Item
          name="currency"
          label={t.restaurants.currency}
          rules={[{ required: true, message: t.restaurants.required }]}
        >
          <Select
            showSearch
            options={CURRENCIES.map((c) => ({ value: c, label: c }))}
            placeholder="UAH"
          />
        </Form.Item>
        {isEdit && (
          <Form.Item name="isActive" label={t.restaurants.active} valuePropName="checked">
            <Switch />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
