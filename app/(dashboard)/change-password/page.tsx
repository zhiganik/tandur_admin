'use client';

import { Card, Form, Input, Button, Typography, App, Alert, Grid } from 'antd';
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { useI18n } from '@/lib/i18n/I18nContext';
import { useState } from 'react';

const { Title, Text } = Typography;

export default function ChangePasswordPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { t } = useI18n();
  const { logout } = useAuthStore();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [requestLoading, setRequestLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

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
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, width: '100%', margin: isMobile ? '0 4px' : 0 }}>
      <Button
        icon={<ArrowLeftOutlined />}
        type="text"
        style={{ marginBottom: 16, paddingLeft: 0 }}
        onClick={() => router.back()}
      >
        {t.common.back}
      </Button>
      <Card>
        <Title level={4} style={{ marginBottom: 24 }}>
          {t.auth.changePassword}
        </Title>

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
            <Form layout="vertical" onFinish={handleReset}>
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
      </Card>
    </div>
  );
}
