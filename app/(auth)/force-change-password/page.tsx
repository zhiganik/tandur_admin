'use client';

import { Card, Form, Input, Button, Typography, App } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { useI18n } from '@/lib/i18n/I18nContext';

const { Title, Text } = Typography;

interface ChangePasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export default function ForceChangePasswordPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { t } = useI18n();
  const { tempToken, setTokens } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !tempToken) {
      router.replace('/login');
    }
  }, [mounted, tempToken, router]);

  if (!mounted || !tempToken) return null;

  const onFinish = async (values: ChangePasswordForm) => {
    setLoading(true);
    try {
      const data = await authApi.changePassword({ newPassword: values.newPassword });
      setTokens(data.accessToken, data.refreshToken, true);
      message.success(t.auth.passwordChanged);
      router.push('/verify-phone');
    } catch {
      message.error(t.auth.passwordChangeFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ width: 400 }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>
        {t.auth.changePassword}
      </Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
        {t.auth.mustChangePassword}
      </Text>
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
  );
}
