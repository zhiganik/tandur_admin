'use client';

import { Modal, Form, Input, InputNumber, TimePicker, Row, Col, Grid } from 'antd';
import { useEffect } from 'react';
import { Restaurant } from '@/types/api';
import { useI18n } from '@/lib/i18n/I18nContext';
import dayjs from 'dayjs';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: RestaurantFormValues) => Promise<void>;
  initialValues?: Restaurant | null;
  loading?: boolean;
}

export interface RestaurantFormValues {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  openTime: string;
  closeTime: string;
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
        ...initialValues,
        openTime: dayjs(initialValues.openTime, 'HH:mm:ss'),
        closeTime: dayjs(initialValues.closeTime, 'HH:mm:ss'),
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit({
      ...values,
      openTime: values.openTime.format('HH:mm:ss'),
      closeTime: values.closeTime.format('HH:mm:ss'),
    });
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
        <Row gutter={12}>
          <Col span={isMobile ? 24 : 12}>
            <Form.Item
              name="openTime"
              label={t.restaurants.openTime}
              rules={[{ required: true, message: t.restaurants.requireOpenTime }]}
            >
              <TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 12}>
            <Form.Item
              name="closeTime"
              label={t.restaurants.closeTime}
              rules={[{ required: true, message: t.restaurants.requireCloseTime }]}
            >
              <TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
