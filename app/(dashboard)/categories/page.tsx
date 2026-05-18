'use client';

import { List, Typography, Button, Spin } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useRestaurants } from '@/lib/hooks/useRestaurants';
import { useI18n } from '@/lib/i18n/I18nContext';

const { Title } = Typography;

export default function CategoriesIndexPage() {
  const { data, isLoading } = useRestaurants();
  const router = useRouter();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>{t.nav.categories}</Title>
      <List
        bordered
        dataSource={data?.data}
        style={{ maxWidth: 480, background: '#fff' }}
        renderItem={(r) => (
          <List.Item
            actions={[
              <Button
                key="open"
                type="link"
                icon={<AppstoreOutlined />}
                onClick={() => router.push(`/restaurants/${r.id}/categories`)}
              >
                {t.common.edit}
              </Button>,
            ]}
          >
            <List.Item.Meta title={r.name} description={r.address} />
          </List.Item>
        )}
      />
    </div>
  );
}
