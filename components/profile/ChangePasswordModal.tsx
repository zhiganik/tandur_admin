'use client';

import { Modal, Form, Input, Button, Alert, Typography, Grid } from 'antd';
import { App } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { useI18n } from '@/lib/i18n/I18nContext';

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: Props) {
  const { message } = App.useApp();
  const { t } = useI18n();
  const { logout } = useAuthStore();
  const [form] = Form.useForm();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [requestLoading, setRequestLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleClose = () => {
    setStep('request');
    form.resetFields();
    onClose();
  };

  const handleRequestReset = async () => {
    setRequestLoading(true);
    try {
      await authApi.requestPasswordReset();
      message.success(t.auth.resetLinkSent);
      setStep('reset');
    } catch {
      message.error(t.auth.resetLinkFailed);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleReset = async (values: { token: string; newPassword: string }) => {
    setResetLoading(true);
    try {
      await authApi.resetPassword({ token: values.token, newPassword: values.newPassword });
      message.success(t.auth.resetPasswordSuccess);
      setTimeout(logout, 1500);
    } catch {
      message.error(t.auth.resetPasswordFailed);
      setResetLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={t.auth.changePassword}
      footer={null}
      destroyOnClose
      width={isMobile ? '100%' : 440}
      style={isMobile ? { top: 0, margin: 0, maxWidth: '100vw', padding: 0 } : undefined}
      styles={isMobile ? { body: { maxHeight: '75vh', overflowY: 'auto' } } : undefined}
    >
      <div style={{ marginTop: 16 }}>
        {step === 'request' ? (
          <>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
              {t.auth.mustChangePassword}
            </Text>
            <Button
              type="primary"
              block
              size="large"
              loading={requestLoading}
              onClick={handleRequestReset}
            >
              {t.auth.sendResetLink}
            </Button>
          </>
        ) : (
          <>
            <Alert
              message={t.auth.checkEmailForToken}
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Form form={form} layout="vertical" onFinish={handleReset}>
              <Form.Item
                name="token"
                label={t.auth.resetToken}
                rules={[{ required: true, message: t.auth.requiredResetToken }]}
              >
                <Input prefix={<LockOutlined />} size="large" />
              </Form.Item>
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
                <Button type="primary" htmlType="submit" block size="large" loading={resetLoading}>
                  {t.common.save}
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </div>
    </Modal>
  );
}
