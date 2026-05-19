'use client';

import { useEffect, useState } from 'react';
import { Dropdown, Typography, Space, Button, App } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { useRestaurantStore } from '@/lib/store/restaurantStore';
import { useMe } from '@/lib/hooks/useMe';
import { useCreateRestaurant } from '@/lib/hooks/useRestaurants';
import RestaurantModal, { RestaurantFormValues } from '@/components/restaurants/RestaurantModal';
import { useI18n } from '@/lib/i18n/I18nContext';
import { useQueryClient } from '@tanstack/react-query';
import { ME_KEY } from '@/lib/hooks/useMe';

const { Text } = Typography;

export default function RestaurantSelector() {
  const { data: me, isSuccess } = useMe();
  const { selectedId, setSelectedId } = useRestaurantStore();
  const isSuperAdmin = me?.roles.includes('SuperAdmin') ?? false;
  const { message } = App.useApp();
  const { t } = useI18n();
  const qc = useQueryClient();
  const createRestaurant = useCreateRestaurant();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const list = me?.restaurants ?? [];

  useEffect(() => {
    if (!isSuccess || !list.length) return;
    if (selectedId && list.some((r) => r.id === selectedId)) return;
    setSelectedId(list[0].id);
  }, [isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (values: RestaurantFormValues) => {
    setSubmitLoading(true);
    try {
      const created = await createRestaurant.mutateAsync(values);
      qc.invalidateQueries({ queryKey: ['restaurants-all'] });
      qc.invalidateQueries({ queryKey: ME_KEY });
      setSelectedId(created.id);
      setModalOpen(false);
      message.success(t.restaurants.saveSuccess);
    } catch {
      message.error(t.restaurants.saveFailed);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!isSuccess || !me) return null;
  if (list.length === 0 && !isSuperAdmin) return null;

  const selected = list.find((r) => r.id === selectedId) ?? list[0];

  return (
    <Space size={8}>
      {list.length === 0 ? null : list.length === 1 ? (
        <Text style={{ fontWeight: 500, fontSize: 13 }}>{selected.name}</Text>
      ) : (
        <Dropdown
          menu={{
            items: list.map((r) => ({ key: r.id, label: r.name })),
            selectedKeys: selected ? [selected.id] : [],
            onClick: ({ key }) => setSelectedId(key),
          }}
          trigger={['click']}
        >
          <Space
            style={{ cursor: 'pointer', fontWeight: 500, fontSize: 13 }}
            onClick={(e) => e.preventDefault()}
          >
            {selected?.name}
            <DownOutlined style={{ fontSize: 10, color: 'rgba(0,0,0,0.45)' }} />
          </Space>
        </Dropdown>
      )}

      {isSuperAdmin && (
        <Button
          size="small"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        />
      )}

      <RestaurantModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        loading={submitLoading}
      />
    </Space>
  );
}
