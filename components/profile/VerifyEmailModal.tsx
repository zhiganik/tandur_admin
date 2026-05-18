'use client';

import { Modal, Form, Input, Button, Grid } from 'antd';
import { App } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { useI18n } from '@/lib/i18n/I18nContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VerifyEmailModal({ open, onClose, onSuccess }: Props) {
  const { message } = App.useApp();
  const { t } = useI18n();
  const [emailForm] = Form.useForm();
  const [codeForm] = Form.useForm();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [newEmail, setNewEmail] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  useEffect(() => {
    if (retryAfter <= 0) return;
    const timer = setTimeout(() => setRetryAfter((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [retryAfter]);

  const handleClose = () => {
    setStep('email');
    setNewEmail('');
    setRetryAfter(0);
    emailForm.resetFields();
    codeForm.resetFields();
    onClose();
  };

  const handleSendCode = async (values: { newEmail: string }) => {
    setSendLoading(true);
    try {
      const res = await authApi.sendEmail({ newEmail: values.newEmail });
      setNewEmail(values.newEmail);
      setRetryAfter(res.retryAfterSeconds ?? 60);
      setStep('code');
      message.success(t.auth.codeSent);
    } catch {
      message.error(t.profile.sendCodeFailed);
    } finally {
      setSendLoading(false);
    }
  };

  const handleVerify = async (values: { code: string }) => {
    setVerifyLoading(true);
    try {
      await authApi.verifyEmail({ newEmail, code: values.code });
      message.success(t.profile.verifiedSuccess);
      onSuccess();
      handleClose();
    } catch {
      message.error(t.profile.verifyFailed);
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    setSendLoading(true);
    try {
      const res = await authApi.sendEmail({ newEmail });
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
      onCancel={handleClose}
      title={t.profile.verifyEmail}
      footer={null}
      destroyOnClose
      width={isMobile ? '100%' : 400}
      style={isMobile ? { top: 0, margin: 0, maxWidth: '100vw', padding: 0 } : undefined}
      styles={isMobile ? { body: { maxHeight: '75vh', overflowY: 'auto' } } : undefined}
    >
      {step === 'email' ? (
        <Form form={emailForm} layout="vertical" onFinish={handleSendCode} style={{ marginTop: 16 }}>
          <Form.Item
            name="newEmail"
            label={t.profile.newEmail}
            rules={[
              { required: true, message: t.auth.requiredEmail },
              { type: 'email', message: t.auth.invalidEmail },
            ]}
          >
            <Input prefix={<MailOutlined />} size="large" placeholder="new@example.com" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={sendLoading}>
              {t.auth.sendCode}
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Form form={codeForm} layout="vertical" onFinish={handleVerify} style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 16, color: 'rgba(0,0,0,0.45)' }}>{newEmail}</div>
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
          <Button type="link" block onClick={() => { setStep('email'); codeForm.resetFields(); }}>
            {t.common.back}
          </Button>
        </Form>
      )}
    </Modal>
  );
}
