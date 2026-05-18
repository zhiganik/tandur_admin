'use client';

import { Card, Form, Input, Button, Typography, App, Grid } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { useI18n } from '@/lib/i18n/I18nContext';

const { Title, Text } = Typography;

export default function SetupPhonePage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { t } = useI18n();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;

  const [phoneForm] = Form.useForm();
  const [codeForm] = Form.useForm();
  const [phone, setPhone] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const check = () => {
      const state = useAuthStore.getState();
      if (!state.isAuthenticated() || !state.needsSetup) {
        router.replace('/login');
      } else {
        setMounted(true);
      }
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

  const handleSendCode = async (values: { newPhone: string }) => {
    setSendLoading(true);
    try {
      const res = await authApi.sendPhone({ newPhone: values.newPhone });
      setPhone(values.newPhone);
      setCodeSent(true);
      setRetryAfter(res.retryAfterSeconds ?? 60);
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
      await authApi.verifyPhone({ newPhone: phone, code: values.code });
      message.success(t.auth.phoneVerified);
      router.push('/verify-email');
      // keep loading=true until page unmounts (redirect in progress)
    } catch {
      message.error(t.auth.verifyFailed);
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    setSendLoading(true);
    try {
      const res = await authApi.sendPhone({ newPhone: phone });
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
        {t.auth.setupPhone}
      </Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
        {t.auth.setupPhoneDesc}
      </Text>

      {!codeSent ? (
        <Form form={phoneForm} layout="vertical" onFinish={handleSendCode}>
          <Form.Item
            name="newPhone"
            label={t.auth.phoneNumber}
            rules={[{ required: true, message: t.auth.requiredPhone }]}
          >
            <Input
              prefix={<PhoneOutlined />}
              size="large"
              placeholder="+380XXXXXXXXX"
              onChange={(e) => {
                let val = e.target.value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
                if (val && !val.startsWith('+')) val = '+' + val;
                phoneForm.setFieldValue('newPhone', val);
              }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={sendLoading}>
              {t.auth.sendCode}
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Form form={codeForm} layout="vertical" onFinish={handleVerify}>
          <Text style={{ display: 'block', marginBottom: 16 }}>{phone}</Text>
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
                codeForm.setFieldValue('code', val);
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
      )}
    </Card>
  );
}
