'use client';

import { Modal, Form, Input, Button, Grid } from 'antd';
import { App } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { useI18n } from '@/lib/i18n/I18nContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VerifyPhoneModal({ open, onClose, onSuccess }: Props) {
  const { message } = App.useApp();
  const { t } = useI18n();
  const [phoneForm] = Form.useForm();
  const [codeForm] = Form.useForm();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  // countdown
  useState(() => {
    if (retryAfter <= 0) return;
    const timer = setTimeout(() => setRetryAfter((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  });

  const handleClose = () => {
    setStep('phone');
    setPhone('');
    setRetryAfter(0);
    phoneForm.resetFields();
    codeForm.resetFields();
    onClose();
  };

  const handleSendCode = async (values: { newPhone: string }) => {
    setSendLoading(true);
    try {
      const res = await authApi.sendPhone({ newPhone: values.newPhone });
      setPhone(values.newPhone);
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
      await authApi.verifyPhone({ newPhone: phone, code: values.code });
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
      const res = await authApi.sendPhone({ newPhone: phone });
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
      title={t.profile.verifyPhone}
      footer={null}
      destroyOnClose
      width={isMobile ? '100%' : 400}
      style={isMobile ? { top: 0, margin: 0, maxWidth: '100vw', padding: 0 } : undefined}
      styles={isMobile ? { body: { maxHeight: '75vh', overflowY: 'auto' } } : undefined}
    >
      {step === 'phone' ? (
        <Form form={phoneForm} layout="vertical" onFinish={handleSendCode} style={{ marginTop: 16 }}>
          <Form.Item
            name="newPhone"
            label={t.profile.newPhone}
            rules={[{ required: true, message: t.profile.requiredPhone }]}
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
        <Form form={codeForm} layout="vertical" onFinish={handleVerify} style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 16, color: 'rgba(0,0,0,0.45)' }}>{phone}</div>
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
          <Button type="link" block onClick={() => { setStep('phone'); codeForm.resetFields(); }}>
            {t.common.back}
          </Button>
        </Form>
      )}
    </Modal>
  );
}
