'use client';

import { Card, Form, Input, Button, Typography, App, Grid } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { useI18n } from '@/lib/i18n/I18nContext';

const { Title, Text } = Typography;

function parseEmail(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ?? payload.email ?? null;
  } catch {
    return null;
  }
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { t } = useI18n();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;

  const [form] = Form.useForm();
  const [email, setEmail] = useState<string | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const check = () => {
      const state = useAuthStore.getState();
      if (!state.isAuthenticated() || !state.needsSetup) {
        router.replace('/login');
        return;
      }
      const parsedEmail = parseEmail(state.accessToken);
      if (!parsedEmail) {
        router.replace('/login');
        return;
      }
      setEmail(parsedEmail);
      setMounted(true);
      // Auto-send OTP on mount
      authApi.sendEmail({ newEmail: parsedEmail })
        .then((res) => setRetryAfter(res.retryAfterSeconds ?? 60))
        .catch(() => {});
    };

    if (useAuthStore.persist.hasHydrated()) { check(); return; }
    const unsub = useAuthStore.persist.onFinishHydration(check);
    return unsub;
  }, [router]);

  // countdown timer
  useEffect(() => {
    if (retryAfter <= 0) return;
    const timer = setTimeout(() => setRetryAfter((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [retryAfter]);

  if (!mounted) return null;

  const handleVerify = async (values: { code: string }) => {
    if (!email) return;
    setVerifyLoading(true);
    try {
      await authApi.verifyEmail({ newEmail: email, code: values.code });
      useAuthStore.getState().setNeedsSetup(false);
      message.success(t.auth.emailVerified);
      router.push('/home');
      // keep loading=true until page unmounts (redirect in progress)
    } catch {
      message.error(t.auth.verifyFailed);
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setSendLoading(true);
    try {
      const res = await authApi.sendEmail({ newEmail: email });
      setRetryAfter(res.retryAfterSeconds ?? 60);
      message.success(t.auth.codeSent);
    } catch {
      message.error(t.auth.sendCodeFailed);
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <Card style={{ width: isMobile ? '100%' : 400, margin: isMobile ? 16 : 0, boxSizing: 'border-box' }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>
        {t.auth.verifyEmail}
      </Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
        {t.auth.verifyEmailDesc}
      </Text>

      <Form form={form} layout="vertical" onFinish={handleVerify}>
        <Text style={{ display: 'block', marginBottom: 16 }}>
          <MailOutlined style={{ marginRight: 8 }} />
          {email}
        </Text>
        <Form.Item
          name="code"
          label={t.auth.verificationCode}
          rules={[{ required: true, message: t.auth.requiredCode }]}
        >
          <Input
            size="large"
            maxLength={6}
            autoFocus
            inputMode="numeric"
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              e.target.value = val;
              form.setFieldValue('code', val);
            }}
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 8 }}>
          <Button type="primary" htmlType="submit" block size="large" loading={verifyLoading}>
            {t.auth.verify}
          </Button>
        </Form.Item>
        <Button
          type="link"
          block
          disabled={retryAfter > 0 || sendLoading}
          loading={sendLoading}
          onClick={handleResend}
        >
          {retryAfter > 0 ? `${t.auth.resendCode} (${retryAfter}s)` : t.auth.resendCode}
        </Button>
      </Form>
    </Card>
  );
}
