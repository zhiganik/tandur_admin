'use client';

import { Modal, Form, Input, Button, Grid } from 'antd';
import { App } from 'antd';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { useI18n } from '@/lib/i18n/I18nContext';

interface Props {
  open: boolean;
  onClose: () => void;
  email: string;
  onSuccess: () => void;
}

export default function VerifyEmailModal({ open, onClose, email, onSuccess }: Props) {
  const { message } = App.useApp();
  const { t } = useI18n();
  const [form] = Form.useForm();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;

  const [verifyLoading, setVerifyLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  useEffect(() => {
    if (!open) { form.resetFields(); setRetryAfter(0); return; }
    setSendLoading(true);
    authApi.sendEmail({ newEmail: email })
      .then((res) => setRetryAfter(res.retryAfterSeconds ?? 60))
      .catch(() => message.error(t.profile.sendCodeFailed))
      .finally(() => setSendLoading(false));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (retryAfter <= 0) return;
    const timer = setTimeout(() => setRetryAfter((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [retryAfter]);

  const handleVerify = async (values: { code: string }) => {
    setVerifyLoading(true);
    try {
      await authApi.verifyEmail({ newEmail: email, code: values.code });
      message.success(t.profile.verifiedSuccess);
      onSuccess();
      onClose();
    } catch {
      message.error(t.profile.verifyFailed);
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    setSendLoading(true);
    try {
      const res = await authApi.sendEmail({ newEmail: email });
      setRetryAfter(res.retryAfterSeconds ?? 60);
      message.success(t.auth.codeSent);
    } catch {
      message.error(t.profile.sendCodeFailed);
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={t.profile.verifyEmail}
      footer={null}
      destroyOnClose
      width={isMobile ? '100%' : 400}
      style={isMobile ? { top: 0, margin: 0, maxWidth: '100vw', padding: 0 } : undefined}
      styles={isMobile ? { body: { maxHeight: '75vh', overflowY: 'auto' } } : undefined}
    >
      <Form form={form} layout="vertical" onFinish={handleVerify} style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 16, color: 'rgba(0,0,0,0.45)' }}>{email}</div>
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
    </Modal>
  );
}
