'use client';

import { useEffect, useState } from 'react';
import { Dropdown, Typography, Space, Button, App } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { useAllRestaurants, useCreateRestaurant } from '@/lib/hooks/useRestaurants';
import { useRestaurantStore } from '@/lib/store/restaurantStore';
import { useMe } from '@/lib/hooks/useMe';
import RestaurantModal, { RestaurantFormValues } from '@/components/restaurants/RestaurantModal';
import { useI18n } from '@/lib/i18n/I18nContext';
import { useQueryClient } from '@tanstack/react-query';

const { Text } = Typography;

export default function RestaurantSelector() {
  const { data, isLoading, isSuccess } = useAllRestaurants();
  const { selectedId, setSelectedId } = useRestaurantStore();
  const { data: me } = useMe();
  const isSuperAdmin = me?.roles.includes('SuperAdmin') ?? false;
  const { message } = App.useApp();
  const { t } = useI18n();
  const qc = useQueryClient();
  const createRestaurant = useCreateRestaurant();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!isSuccess || !data?.data?.length) return;
    if (selectedId && data.data.some((r) => r.id === selectedId)) return;
    setSelectedId(data.data[0].id);
  }, [isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (values: RestaurantFormValues) => {
    setSubmitLoading(true);
    try {
      const created = await createRestaurant.mutateAsync(values);
      qc.invalidateQueries({ queryKey: ['restaurants-all'] });
      setSelectedId(created.id);
      setModalOpen(false);
      message.success(t.restaurants.saveSuccess);
    } catch {
      message.error(t.restaurants.saveFailed);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (isLoading || !data?.data) return null;

  const list = data.data;
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
            {selected.name}
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
