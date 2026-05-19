'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Collapse, Button, Typography, App, Spin, Switch, Space, Popconfirm, Badge, Drawer, Descriptions, Input, type InputRef } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined, MinusSquareOutlined, HolderOutlined, PictureOutlined, CheckOutlined, CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useQuery } from '@tanstack/react-query';
import { menuApi } from '@/lib/api/menu';
import { useRestaurantStore } from '@/lib/store/restaurantStore';
import { useAllRestaurants, useUpdateRestaurant } from '@/lib/hooks/useRestaurants';
import { useCreateCategory, useUpdateCategory, useDeleteCategory, usePatchCategory } from '@/lib/hooks/useCategories';
import { useCreateMenuItem, useUpdateMenuItem, usePatchMenuItem, useDeleteMenuItem } from '@/lib/hooks/useMenu';
import { useMe } from '@/lib/hooks/useMe';
import { useI18n } from '@/lib/i18n/I18nContext';
import { useQueryClient } from '@tanstack/react-query';
import CategoryModal, { CategoryFormValues } from '@/components/categories/CategoryModal';
import MenuItemModal, { MenuItemFormValues } from '@/components/menu/MenuItemModal';
import RestaurantModal, { RestaurantFormValues } from '@/components/restaurants/RestaurantModal';
import { Category, MenuItem } from '@/types/api';

const { Title, Text } = Typography;

// ── Item image ───────────────────────────────────────────────────────────────

const placeholder = (
  <div style={{
    width: 40, height: 40, borderRadius: 4, flexShrink: 0,
    background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <PictureOutlined style={{ fontSize: 18, color: 'rgba(0,0,0,0.2)' }} />
  </div>
);

function ItemImage({ url, name }: { url: string | null; name: string }) {
  const [broken, setBroken] = useState(false);
  if (!url || broken) return placeholder;
  return (
    <img
      src={url}
      alt={name}
      onError={() => setBroken(true)}
      style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
    />
  );
}

// ── Item rows ────────────────────────────────────────────────────────────────

interface ItemsTableProps {
  catId: string;
  items: MenuItem[];
  t: ReturnType<typeof useI18n>['t'];
  patchItem: ReturnType<typeof usePatchMenuItem>;
  onToggle: (id: string, v: boolean) => void;
  onToggleActive: (id: string, v: boolean) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}

function ItemsTable({ catId, items, t, patchItem, onToggle, onToggleActive, onEdit, onDelete }: ItemsTableProps) {
  return (
    <Droppable droppableId={catId} type="ITEM">
      {(dropProvided) => (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px', width: 24 }} />
                <th style={{ padding: '6px 8px', fontWeight: 500 }}>{t.menu.name}</th>
                <th style={{ padding: '6px 8px', fontWeight: 500 }}>{t.menu.price}</th>
                <th style={{ padding: '6px 8px', fontWeight: 500 }}>{t.menu.available}</th>
                <th style={{ padding: '6px 8px', fontWeight: 500 }}>{t.menu.active}</th>
                <th style={{ padding: '6px 8px', width: 80 }} />
              </tr>
            </thead>
            <tbody ref={dropProvided.innerRef} {...dropProvided.droppableProps} style={{ minHeight: 40 }}>
              {items.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '8px', color: 'rgba(0,0,0,0.35)', fontSize: 12 }}>No items</td></tr>
              )}
              {items.map((item, idx) => (
                <Draggable key={item.id} draggableId={item.id} index={idx}>
                  {(dragProvided, dragSnapshot) => (
                    <tr
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      style={{
                        borderBottom: '1px solid #f9f9f9',
                        background: dragSnapshot.isDragging ? '#fafafa' : undefined,
                        ...dragProvided.draggableProps.style,
                      }}
                    >
                      <td style={{ padding: '6px 8px' }}>
                        <span {...dragProvided.dragHandleProps} style={{ cursor: 'grab', color: 'rgba(0,0,0,0.25)' }}>
                          <HolderOutlined />
                        </span>
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ItemImage url={item.imageUrl} name={item.name} />
                          <div>
                            <div>{item.name}</div>
                            {item.shortDescription && (
                              <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{item.shortDescription}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                        {item.price} {item.currency ?? ''}
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <Switch
                          size="small"
                          checked={item.isAvailable}
                          onChange={(v) => onToggle(item.id, v)}
                          loading={patchItem.isPending && patchItem.variables?.id === item.id}
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <Switch
                          size="small"
                          checked={item.isActive}
                          onChange={(v) => onToggleActive(item.id, v)}
                          loading={patchItem.isPending && patchItem.variables?.id === item.id}
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <Space size={4}>
                          <Button size="small" icon={<EditOutlined />} type="text" onClick={() => onEdit(item)} />
                          <Popconfirm
                            title={t.menu.deleteConfirm}
                            onConfirm={() => onDelete(item.id)}
                            okText={t.common.yes}
                            cancelText={t.common.no}
                          >
                            <Button size="small" icon={<DeleteOutlined />} type="text" danger />
                          </Popconfirm>
                        </Space>
                      </td>
                    </tr>
                  )}
                </Draggable>
              ))}
              {dropProvided.placeholder}
            </tbody>
          </table>
        </div>
      )}
    </Droppable>
  );
}

// ── Category panel ────────────────────────────────────────────────────────────

interface CategoryPanelProps {
  cat: Category;
  items: MenuItem[];
  isOpen: boolean;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  t: ReturnType<typeof useI18n>['t'];
  patchItem: ReturnType<typeof usePatchMenuItem>;
  patchCategory: ReturnType<typeof usePatchCategory>;
  updateCategory: ReturnType<typeof useUpdateCategory>;
  onToggleOpen: (id: string) => void;
  onDeleteCat: (id: string) => void;
  onAddItem: (catId: string) => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleAvailable: (id: string, v: boolean) => void;
  onToggleActive: (id: string, v: boolean) => void;
  onInvalidate: () => void;
}

function CategoryPanel({
  cat, items, isOpen, dragHandleProps, t, patchItem, patchCategory, updateCategory,
  onToggleOpen, onDeleteCat, onAddItem, onEditItem, onDeleteItem, onToggleAvailable, onToggleActive, onInvalidate,
}: CategoryPanelProps) {
  const { message } = App.useApp();
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(cat.name);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => { setNameValue(cat.name); }, [cat.name]);

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commitEdit = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed === cat.name) { setEditing(false); setNameValue(cat.name); return; }
    try {
      await updateCategory.mutateAsync({ id: cat.id, data: { name: trimmed, sortOrder: cat.sortOrder, isVisible: cat.isVisible } });
      onInvalidate();
    } catch {
      message.error(t.categories.saveFailed);
      setNameValue(cat.name);
    }
    setEditing(false);
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(false);
    setNameValue(cat.name);
  };

  const handleToggleVisible = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await patchCategory.mutateAsync({ id: cat.id, data: { isVisible: !cat.isVisible } });
      onInvalidate();
    } catch {
      message.error(t.categories.statusFailed);
    }
  };

  const label = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span {...dragHandleProps} style={{ cursor: 'grab', color: 'rgba(0,0,0,0.25)', lineHeight: 1 }} onClick={(e) => e.stopPropagation()}>
        <HolderOutlined />
      </span>

      {editing ? (
        <Space size={4} onClick={(e) => e.stopPropagation()}>
          <Input
            ref={inputRef}
            size="small"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onPressEnter={commitEdit}
            onBlur={commitEdit}
            style={{ width: 160 }}
          />
          <Button size="small" type="text" icon={<CheckOutlined style={{ color: '#52c41a' }} />} onMouseDown={(e) => { e.preventDefault(); commitEdit(); }} />
          <Button size="small" type="text" icon={<CloseOutlined />} onMouseDown={cancelEdit} />
        </Space>
      ) : (
        <Space size={4} onClick={(e) => e.stopPropagation()}>
          <span style={{ fontWeight: 500 }}>{cat.name}</span>
          <Button size="small" type="text" icon={<EditOutlined style={{ color: 'rgba(0,0,0,0.35)' }} />} onClick={startEdit} />
        </Space>
      )}

      <Badge count={items.length} color="blue" showZero />

      <Space size={4} onClick={(e) => e.stopPropagation()}>
        <span onClick={handleToggleVisible}>
          <Switch
            size="small"
            checked={cat.isVisible}
            loading={patchCategory.isPending}
            onChange={() => {}}
          />
        </span>
        <Popconfirm
          title={t.categories.deleteConfirm}
          onConfirm={() => onDeleteCat(cat.id)}
          okText={t.common.yes}
          cancelText={t.common.no}
        >
          <Button size="small" icon={<DeleteOutlined />} type="text" danger />
        </Popconfirm>
      </Space>
    </div>
  );

  return (
    <Collapse
      activeKey={isOpen ? [cat.id] : []}
      onChange={() => onToggleOpen(cat.id)}
      items={[{
        key: cat.id,
        label,
        children: (
          <div>
            <Button
              size="small"
              icon={<PlusOutlined />}
              style={{ marginBottom: 12 }}
              onClick={() => onAddItem(cat.id)}
            >
              {t.menu.addButton}
            </Button>
            <ItemsTable
              catId={cat.id}
              items={items}
              t={t}
              patchItem={patchItem}
              onToggle={onToggleAvailable}
              onToggleActive={onToggleActive}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
            />
          </div>
        ),
      }]}
    />
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { t } = useI18n();
  const { message } = App.useApp();
  const qc = useQueryClient();
  const selectedId = useRestaurantStore((s) => s.selectedId);

  const { data: restaurantsData } = useAllRestaurants();
  const selectedRestaurant = restaurantsData?.data?.find((r) => r.id === selectedId) ?? null;
  const { data: me } = useMe();
  const isSuperAdmin = me?.roles.includes('SuperAdmin') ?? false;
  const updateRestaurant = useUpdateRestaurant();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRestaurantOpen, setEditRestaurantOpen] = useState(false);
  const [editRestaurantLoading, setEditRestaurantLoading] = useState(false);

  const handleUpdateRestaurant = async (values: RestaurantFormValues) => {
    if (!selectedId) return;
    setEditRestaurantLoading(true);
    try {
      await updateRestaurant.mutateAsync({ id: selectedId, data: values });
      qc.invalidateQueries({ queryKey: ['restaurants-all'] });
      setEditRestaurantOpen(false);
      setDrawerOpen(false);
      message.success(t.restaurants.saveSuccess);
    } catch {
      message.error(t.restaurants.saveFailed);
    } finally {
      setEditRestaurantLoading(false);
    }
  };

  const { data: menuData, isLoading } = useQuery({
    queryKey: ['full-menu', selectedId],
    queryFn: () => menuApi.getFullMenu(selectedId!),
    enabled: !!selectedId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['full-menu', selectedId] });

  const createCategory = useCreateCategory(selectedId ?? '');
  const updateCategory = useUpdateCategory(selectedId ?? '');
  const patchCategory = usePatchCategory(selectedId ?? '');
  const deleteCategory = useDeleteCategory(selectedId ?? '');

  const createItem = useCreateMenuItem(selectedId ?? '');
  const updateItem = useUpdateMenuItem(selectedId ?? '');
  const patchItem = usePatchMenuItem(selectedId ?? '');
  const deleteItem = useDeleteMenuItem(selectedId ?? '');

  const serverCategories = useMemo(() => menuData?.categories ?? [], [menuData]);
  const serverItems = useMemo(() => menuData?.items?.data ?? [], [menuData]);

  const [sortedCategories, setSortedCategories] = useState<Category[]>([]);
  const [sortedItems, setSortedItems] = useState<Record<string, MenuItem[]>>({});

  useEffect(() => {
    setSortedCategories([...serverCategories].sort((a, b) => a.sortOrder - b.sortOrder));
  }, [serverCategories]);

  useEffect(() => {
    const map: Record<string, MenuItem[]> = {};
    for (const item of serverItems) {
      if (!map[item.categoryId]) map[item.categoryId] = [];
      map[item.categoryId].push(item);
    }
    for (const key of Object.keys(map)) map[key].sort((a, b) => a.sortOrder - b.sortOrder);
    setSortedItems(map);
  }, [serverItems]);

  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const allExpanded = sortedCategories.length > 0 && activeKeys.length === sortedCategories.length;

  // Reset open panels when switching restaurant
  useEffect(() => {
    setActiveKeys([]);
  }, [selectedId]);

  useEffect(() => {
    if (sortedCategories.length > 0) {
      setActiveKeys(sortedCategories.map((c) => c.id));
    }
  }, [sortedCategories.length, selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemCategoryId, setItemCategoryId] = useState<string | null>(null);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

    if (type === 'CATEGORY') {
      const reordered = [...sortedCategories];
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      setSortedCategories(reordered);
      try {
        await Promise.all(
          reordered.map((cat, idx) =>
            cat.sortOrder !== idx ? patchCategory.mutateAsync({ id: cat.id, data: { sortOrder: idx } }) : Promise.resolve()
          )
        );
        invalidate();
      } catch {
        message.error(t.categories.saveFailed);
        setSortedCategories([...serverCategories].sort((a, b) => a.sortOrder - b.sortOrder));
      }
      return;
    }

    if (type === 'ITEM') {
      const srcCatId = source.droppableId;
      const dstCatId = destination.droppableId;
      const srcItems = [...(sortedItems[srcCatId] ?? [])];
      const [moved] = srcItems.splice(source.index, 1);

      let newSorted: Record<string, MenuItem[]>;
      if (srcCatId === dstCatId) {
        srcItems.splice(destination.index, 0, moved);
        newSorted = { ...sortedItems, [srcCatId]: srcItems };
      } else {
        const dstItems = [...(sortedItems[dstCatId] ?? [])];
        dstItems.splice(destination.index, 0, { ...moved, categoryId: dstCatId });
        newSorted = { ...sortedItems, [srcCatId]: srcItems, [dstCatId]: dstItems };
      }
      setSortedItems(newSorted);

      try {
        const patches: Promise<unknown>[] = [];
        if (srcCatId !== dstCatId) {
          // Change category + set sortOrder in destination
          patches.push(patchItem.mutateAsync({ id: moved.id, data: { categoryId: dstCatId, sortOrder: destination.index } }));
          // Re-order remaining items in source
          newSorted[srcCatId].forEach((item, idx) => {
            if (item.sortOrder !== idx) patches.push(patchItem.mutateAsync({ id: item.id, data: { sortOrder: idx } }));
          });
          // Re-order items in destination (skip moved, already patched)
          newSorted[dstCatId].forEach((item, idx) => {
            if (item.id !== moved.id && item.sortOrder !== idx) patches.push(patchItem.mutateAsync({ id: item.id, data: { sortOrder: idx } }));
          });
        } else {
          newSorted[srcCatId].forEach((item, idx) => {
            if (item.sortOrder !== idx) patches.push(patchItem.mutateAsync({ id: item.id, data: { sortOrder: idx } }));
          });
        }
        await Promise.all(patches);
        invalidate();
      } catch {
        message.error(t.menu.saveFailed);
        const map: Record<string, MenuItem[]> = {};
        for (const item of serverItems) {
          if (!map[item.categoryId]) map[item.categoryId] = [];
          map[item.categoryId].push(item);
        }
        setSortedItems(map);
      }
    }
  };

  const handleSaveCategory = async (values: CategoryFormValues) => {
    try {
      await createCategory.mutateAsync(values);
      invalidate();
      setCatModalOpen(false);
      message.success(t.categories.saveSuccess);
    } catch {
      message.error(t.categories.saveFailed);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      invalidate();
      message.success(t.categories.deleteSuccess);
    } catch {
      message.error(t.categories.deleteFailed);
    }
  };

  const handleSaveItem = async (values: MenuItemFormValues) => {
    try {
      if (editingItem) await updateItem.mutateAsync({ id: editingItem.id, data: { ...values, isActive: values.isActive ?? editingItem.isActive } });
      else await createItem.mutateAsync({ ...values, restaurantId: selectedId!, categoryId: itemCategoryId ?? values.categoryId });
      invalidate();
      setItemModalOpen(false);
      setEditingItem(null);
      message.success(t.menu.saveSuccess);
    } catch {
      message.error(t.menu.saveFailed);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem.mutateAsync(id);
      invalidate();
      message.success(t.menu.deleteSuccess);
    } catch {
      message.error(t.menu.deleteFailed);
    }
  };

  const handleToggleAvailable = async (id: string, isAvailable: boolean) => {
    try {
      await patchItem.mutateAsync({ id, data: { isAvailable } });
      invalidate();
    } catch {
      message.error(t.menu.availabilityFailed);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await patchItem.mutateAsync({ id, data: { isActive } });
      invalidate();
    } catch {
      message.error(t.menu.availabilityFailed);
    }
  };

  if (!selectedId) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Text type="secondary">Select a restaurant to get started</Text>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <Space size={8}>
            <Title level={4} style={{ margin: 0 }}>{selectedRestaurant?.name ?? t.nav.home}</Title>
            <Button
              type="text"
              size="small"
              icon={<InfoCircleOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />}
              onClick={() => setDrawerOpen(true)}
            />
            {isSuperAdmin && (
              <Button
                type="text"
                size="small"
                icon={<EditOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />}
                onClick={() => setEditRestaurantOpen(true)}
              />
            )}
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCatModalOpen(true)}>
            {t.categories.addButton}
          </Button>
        </div>

        {sortedCategories.length === 0 ? (
          <Text type="secondary">No categories yet. Add one to get started.</Text>
        ) : (
          <>
            <div style={{ marginBottom: 8 }}>
              <Button
                type="text"
                size="small"
                icon={allExpanded ? <MinusSquareOutlined /> : <UnorderedListOutlined />}
                onClick={() => setActiveKeys(allExpanded ? [] : sortedCategories.map((c) => c.id))}
              >
                {allExpanded ? 'Collapse all' : 'Expand all'}
              </Button>
            </div>
            <Droppable droppableId="categories" type="CATEGORY">
              {(dropProvided) => (
                <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {sortedCategories.map((cat, idx) => (
                    <Draggable key={cat.id} draggableId={`cat-${cat.id}`} index={idx}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          style={{
                            borderRadius: 8,
                            background: dragSnapshot.isDragging ? '#f0f7ff' : undefined,
                            ...dragProvided.draggableProps.style,
                          }}
                        >
                          <CategoryPanel
                            cat={cat}
                            items={sortedItems[cat.id] ?? []}
                            isOpen={activeKeys.includes(cat.id)}
                            dragHandleProps={dragProvided.dragHandleProps}
                            t={t}
                            patchItem={patchItem}
                            patchCategory={patchCategory}
                            updateCategory={updateCategory}
                            onToggleOpen={(id) =>
                              setActiveKeys((prev) =>
                                prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
                              )
                            }
                            onDeleteCat={handleDeleteCategory}
                            onAddItem={(catId) => { setItemCategoryId(catId); setEditingItem(null); setItemModalOpen(true); }}
                            onEditItem={(item) => { setEditingItem(item); setItemCategoryId(item.categoryId); setItemModalOpen(true); }}
                            onDeleteItem={handleDeleteItem}
                            onToggleAvailable={handleToggleAvailable}
                            onToggleActive={handleToggleActive}
                            onInvalidate={invalidate}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {dropProvided.placeholder}
                </div>
              )}
            </Droppable>
          </>
        )}

        {/* Restaurant info drawer */}
        <Drawer
          title={selectedRestaurant?.name}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={360}
          extra={isSuperAdmin && (
            <Button icon={<EditOutlined />} onClick={() => { setDrawerOpen(false); setEditRestaurantOpen(true); }}>
              {t.common.edit}
            </Button>
          )}
        >
          {selectedRestaurant && (
            <Descriptions column={1} size="small">
              <Descriptions.Item label={t.restaurants.address}>{selectedRestaurant.address}</Descriptions.Item>
              <Descriptions.Item label={t.restaurants.hours}>
                {selectedRestaurant.openTime?.slice(0, 5)} — {selectedRestaurant.closeTime?.slice(0, 5)}
              </Descriptions.Item>
              <Descriptions.Item label={t.restaurants.latitude}>{selectedRestaurant.latitude}</Descriptions.Item>
              <Descriptions.Item label={t.restaurants.longitude}>{selectedRestaurant.longitude}</Descriptions.Item>
              <Descriptions.Item label={t.restaurants.active}>
                <Switch size="small" checked={selectedRestaurant.isActive} disabled />
              </Descriptions.Item>
            </Descriptions>
          )}
        </Drawer>

        {/* Edit restaurant modal (SuperAdmin only) */}
        {isSuperAdmin && selectedRestaurant && (
          <RestaurantModal
            open={editRestaurantOpen}
            onClose={() => setEditRestaurantOpen(false)}
            onSubmit={handleUpdateRestaurant}
            initialValues={selectedRestaurant}
            loading={editRestaurantLoading}
          />
        )}

        <CategoryModal
          open={catModalOpen}
          onClose={() => setCatModalOpen(false)}
          onSubmit={handleSaveCategory}
          loading={createCategory.isPending}
        />

        <MenuItemModal
          open={itemModalOpen}
          onClose={() => { setItemModalOpen(false); setEditingItem(null); setItemCategoryId(null); }}
          onSubmit={handleSaveItem}
          initialValues={editingItem}
          defaultCategoryId={editingItem ? null : itemCategoryId}
          categories={sortedCategories}
          loading={createItem.isPending || updateItem.isPending}
        />
      </div>
    </DragDropContext>
  );
}
