'use client';

import { Card, Form, Input, Button, Typography, App, Grid } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { useI18n } from '@/lib/i18n/I18nContext';

const { Title, Text } = Typography;

function getEmailFromJwt(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ??
      payload.email ??
      null
    );
  } catch {
    return null;
  }
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { t } = useI18n();
  const { sessionToken, accessToken, clearSessionToken, logout } = useAuthStore();

  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;
  const [codeSent, setCodeSent] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const email = getEmailFromJwt(accessToken);

  useEffect(() => {
    const check = () => {
      if (!useAuthStore.getState().sessionToken) {
        router.replace('/verify-phone');
      } else {
        setMounted(true);
      }
    };

    if (useAuthStore.persist.hasHydrated()) {
      check();
      return;
    }

    const unsub = useAuthStore.persist.onFinishHydration(check);
    return unsub;
  }, [router]);

  // auto-send code once mounted
  useEffect(() => {
    if (!mounted || !sessionToken || !email || codeSent) return;

    setSendLoading(true);
    authApi.sendEmail({ sessionToken, email })
      .then(() => {
        setCodeSent(true);
        message.success(t.auth.codeSent);
      })
      .catch(() => message.error(t.auth.sendCodeFailed))
      .finally(() => setSendLoading(false));
  }, [mounted, sessionToken, email, codeSent, message, t]);

  const handleVerify = async (values: { code: string }) => {
    if (!email) return;
    setVerifyLoading(true);
    try {
      await authApi.verifyEmail({ sessionToken: sessionToken!, email, code: values.code });
      clearSessionToken();
      message.success(t.auth.setupComplete);
      setTimeout(logout, 1500);
    } catch {
      message.error(t.auth.verifyFailed);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = () => {
    setCodeSent(false);
  };

  if (!mounted || !sessionToken) return null;

  return (
    <Card style={{ width: isMobile ? '100%' : 400, margin: isMobile ? 16 : 0, boxSizing: 'border-box' }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>
        {t.auth.verifyEmail}
      </Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
        {t.auth.verifyEmailDesc}
      </Text>

      {email && (
        <Text style={{ display: 'block', textAlign: 'center', marginBottom: 16, fontWeight: 500 }}>
          {email}
        </Text>
      )}

      {sendLoading && !codeSent ? (
        <Button type="primary" block size="large" loading>
          {t.auth.sendCode}
        </Button>
      ) : (
        <Form layout="vertical" onFinish={handleVerify}>
          <Form.Item
            name="code"
            label={t.auth.verificationCode}
            rules={[{ required: true, message: t.auth.requiredCode }]}
          >
            <Input size="large" maxLength={6} autoFocus />
          </Form.Item>
          <Form.Item style={{ marginBottom: 8 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={verifyLoading}>
              {t.auth.verify}
            </Button>
          </Form.Item>
          <Button type="link" block onClick={handleResend}>
            {t.auth.resendCode}
          </Button>
        </Form>
      )}
    </Card>
  );
}
