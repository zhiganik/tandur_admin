'use client';

import { Form, Input, Button, Typography, App, Divider, Space, Grid } from 'antd';
import { CheckCircleOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { DatePicker } from 'antd';
import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { meApi } from '@/lib/api/me';
import { useMe, useInvalidateMe } from '@/lib/hooks/useMe';
import { useI18n } from '@/lib/i18n/I18nContext';
import VerifyEmailModal from '@/components/profile/VerifyEmailModal';
import VerifyPhoneModal from '@/components/profile/VerifyPhoneModal';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';

const { Title, Text } = Typography;

interface ProfileForm {
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: Dayjs | null;
}

export default function ProfilePage() {
  const { message } = App.useApp();
  const { t } = useI18n();
  const [form] = Form.useForm<ProfileForm>();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;

  const { data: me } = useMe();
  const invalidateMe = useInvalidateMe();
  const [saveLoading, setSaveLoading] = useState(false);
  const [verifyEmailOpen, setVerifyEmailOpen] = useState(false);
  const [verifyPhoneOpen, setVerifyPhoneOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  useEffect(() => {
    if (!me) return;
    form.setFieldsValue({
      firstName: me.firstName,
      lastName: me.lastName,
      dateOfBirth: me.dateOfBirth ? dayjs(me.dateOfBirth) : null,
    });
  }, [me, form]);

  const handleSave = async (values: ProfileForm) => {
    setSaveLoading(true);
    try {
      await meApi.update({
        firstName: values.firstName || null,
        lastName: values.lastName || null,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
      });
      await invalidateMe();
      message.success(t.profile.saveSuccess);
    } catch {
      message.error(t.profile.saveFailed);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}>{t.profile.title}</Title>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Form.Item name="firstName" label={t.profile.firstName}>
          <Input size="large" />
        </Form.Item>
        <Form.Item name="lastName" label={t.profile.lastName}>
          <Input size="large" />
        </Form.Item>
        <Form.Item name="dateOfBirth" label={t.profile.dateOfBirth}>
          <DatePicker
            size="large"
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            allowClear
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={saveLoading} size="large">
            {t.common.save}
          </Button>
        </Form.Item>
      </Form>

      <Divider />

      {/* Email row */}
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
          <MailOutlined style={{ marginRight: 6 }} />Email
        </Text>
        <Space wrap>
          <Text>{me?.email ?? '—'}</Text>
          {me?.emailConfirmed && (
            <Text style={{ color: '#52c41a' }}>
              <CheckCircleOutlined style={{ marginRight: 4 }} />{t.profile.emailConfirmed}
            </Text>
          )}
          <Button size="small" onClick={() => setVerifyEmailOpen(true)}>
            {t.profile.changeEmail}
          </Button>
        </Space>
      </div>

      {/* Phone row */}
      <div style={{ marginBottom: 24 }}>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
          <PhoneOutlined style={{ marginRight: 6 }} />Phone
        </Text>
        <Space wrap>
          <Text>{me?.phone ?? '—'}</Text>
          {me?.phoneNumberConfirmed && (
            <Text style={{ color: '#52c41a' }}>
              <CheckCircleOutlined style={{ marginRight: 4 }} />{t.profile.phoneConfirmed}
            </Text>
          )}
          <Button size="small" onClick={() => setVerifyPhoneOpen(true)}>
            {t.profile.changePhone}
          </Button>
        </Space>
      </div>

      <Divider />

      <Button
        icon={<LockOutlined />}
        size={isMobile ? 'middle' : 'large'}
        onClick={() => setChangePasswordOpen(true)}
      >
        {t.profile.changePassword}
      </Button>

      <VerifyEmailModal
        open={verifyEmailOpen}
        onClose={() => setVerifyEmailOpen(false)}
        onSuccess={invalidateMe}
      />
      <VerifyPhoneModal
        open={verifyPhoneOpen}
        onClose={() => setVerifyPhoneOpen(false)}
        onSuccess={invalidateMe}
      />
      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  );
}
