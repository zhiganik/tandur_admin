'use client';

import { Card, Form, Input, Button, Typography, App, Grid } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { useI18n } from '@/lib/i18n/I18nContext';

const { Title, Text } = Typography;

export default function VerifyPhonePage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { t } = useI18n();
  const { setSessionToken, setNeedsVerification } = useAuthStore();

  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;
  const [phone, setPhone] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const check = () => {
      if (!useAuthStore.getState().needsVerification) {
        router.replace('/login');
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

  if (!mounted) return null;

  const handleSendCode = async (values: { phoneNumber: string }) => {
    setSendLoading(true);
    try {
      await authApi.sendPhone({ phoneNumber: values.phoneNumber });
      setPhone(values.phoneNumber);
      setCodeSent(true);
      message.success(t.auth.codeSent);
    } catch {
      message.error(t.auth.sendCodeFailed);
    } finally {
      setSendLoading(false);
    }
  };

  const handleVerify = async (values: { code: string }) => {
    setVerifyLoading(true);
    try {
      const data = await authApi.verifyPhone({ phoneNumber: phone, code: values.code });
      setSessionToken(data.sessionToken);
      setNeedsVerification(false);
      message.success(t.auth.phoneVerified);
      router.push('/verify-email');
    } catch {
      message.error(t.auth.verifyFailed);
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <Card style={{ width: isMobile ? '100%' : 400, margin: isMobile ? 16 : 0, boxSizing: 'border-box' }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>
        {t.auth.verifyPhone}
      </Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
        {t.auth.verifyPhoneDesc}
      </Text>

      {!codeSent ? (
        <Form layout="vertical" onFinish={handleSendCode}>
          <Form.Item
            name="phoneNumber"
            label={t.auth.phoneNumber}
            rules={[{ required: true, message: t.auth.requiredPhone }]}
          >
            <Input prefix={<PhoneOutlined />} size="large" placeholder="+380XXXXXXXXX" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={sendLoading}>
              {t.auth.sendCode}
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Form layout="vertical" onFinish={handleVerify}>
          <Text style={{ display: 'block', marginBottom: 16 }}>
            {phone}
          </Text>
          <Form.Item
            name="code"
            label={t.auth.verificationCode}
            rules={[{ required: true, message: t.auth.requiredCode }]}
          >
            <Input size="large" maxLength={6} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 8 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={verifyLoading}>
              {t.auth.verify}
            </Button>
          </Form.Item>
          <Button
            type="link"
            block
            onClick={() => setCodeSent(false)}
          >
            {t.auth.resendCode}
          </Button>
        </Form>
      )}
    </Card>
  );
}
