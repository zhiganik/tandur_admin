'use client';

import { Card, Form, Input, Button, Typography, App } from 'antd';
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useI18n } from '@/lib/i18n/I18nContext';
import { useState } from 'react';

const { Title } = Typography;

interface ChangePasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: ChangePasswordForm) => {
    setLoading(true);
    try {
      await authApi.changePassword({ newPassword: values.newPassword });
      message.success(t.auth.passwordChanged);
      router.push('/users');
    } catch {
      message.error(t.auth.passwordChangeFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400 }}>
      <Button
        icon={<ArrowLeftOutlined />}
        type="text"
        style={{ marginBottom: 16, paddingLeft: 0 }}
        onClick={() => router.back()}
      >
        {t.common.back}
      </Button>
      <Card>
        <Title level={4} style={{ marginBottom: 24 }}>
          {t.auth.changePassword}
        </Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="newPassword"
            label={t.auth.newPassword}
            rules={[
              { required: true, message: t.auth.requiredNewPassword },
              { min: 6, message: t.auth.passwordMinLength },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} size="large" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={t.auth.confirmPassword}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: t.auth.requiredConfirmPassword },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t.auth.passwordMismatch));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} size="large" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              {t.common.save}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
