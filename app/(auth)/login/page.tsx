'use client';

import { Card, Form, Input, Button, Typography, App, Grid } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { useRestaurantStore } from '@/lib/store/restaurantStore';
import { useI18n } from '@/lib/i18n/I18nContext';
import { useState, useEffect } from 'react';
import type { AuthResponse, PasswordChangeRequiredResponse } from '@/types/api';

const { Title } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { setTokens, setTempToken, isAuthenticated } = useAuthStore();
  const { message } = App.useApp();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;

  useEffect(() => {
    useRestaurantStore.getState().clear();
  }, []);

  useEffect(() => {
    const check = () => {
      if (isAuthenticated()) {
        router.replace('/home');
      } else {
        setHydrated(true);
      }
    };

    if (useAuthStore.persist.hasHydrated()) {
      check();
      return;
    }

    const unsub = useAuthStore.persist.onFinishHydration(check);
    return unsub;
  }, [isAuthenticated, router]);

  if (!hydrated) return null;

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const data = await authApi.login(values);
      if ('requiresPasswordChange' in data && data.requiresPasswordChange) {
        setTempToken((data as PasswordChangeRequiredResponse).token);
        router.push('/force-change-password');
      } else {
        const auth = data as AuthResponse;
        setTokens(auth.accessToken, auth.refreshToken);
        router.push('/home');
      }
      // keep loading=true until page unmounts (redirect in progress)
    } catch {
      message.error(t.auth.invalidCredentials);
      setLoading(false);
    }
  };

  return (
    <Card style={{ width: isMobile ? '100%' : 400, margin: isMobile ? 16 : 0, boxSizing: 'border-box' }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
        {t.auth.title}
      </Title>
      <Form layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item
          name="email"
          rules={[
            { required: true, message: t.auth.requiredEmail },
            { type: 'email', message: t.auth.invalidEmail },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder={t.auth.email} size="large" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: t.auth.requiredPassword }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder={t.auth.password} size="large" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            {t.auth.login}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
