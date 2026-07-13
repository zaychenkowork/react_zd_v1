# Модалки

## `ModalCore` — parent-owned

Единственный модальный компонент шаблона — `ui/components/ModalCore/ModalCore.tsx`, на
`radix-ui` `Dialog`. Полностью **parent-owned**: не хранит своё открытое/закрытое состояние —
родитель передаёт `isOpen`/`setOpen` пропсами:

```tsx
const [isModalOpen, setModalOpen] = useState(false);

<ModalCore
  isOpen={isModalOpen}
  setOpen={setModalOpen}
  title={t('home.demoModalTitle')}
  description={t('home.demoModalDescription')}
  confirmAction={() => setModalOpen(false)}
  cancelAction={() => setModalOpen(false)}
/>
```

`setOpen` передаётся прямо в Radix'ов `onOpenChange`, поэтому автоматически срабатывает и на
клик по оверлею, и на Escape (фокус-трап и обработка Escape — из Radix, ничего не реализовано
руками). Пример — `pages/Home/HomePage.tsx`.

Пропсы: `isOpen`, `setOpen`, `title?`, `description?`, `confirmAction?`, `cancelAction?`
(кнопки рендерятся только если действие передано), `loading?` (спиннер на confirm, дизейблит обе
кнопки), `hasCloseButton?` (по умолчанию `true`), `confirmText?`/`cancelText?` (иначе — переводы
`common.save`/`common.cancel`), `children?`.

Модалка без `title` всё равно получает заголовок в дерево доступности — `VisuallyHidden.Root`
с `t('common.close')` — Radix `Dialog` требует `Dialog.Title` для скринридеров независимо от
того, нужен ли заголовок визуально.

## Когда переходить на глобальный менеджер

Пока в шаблоне одна модалка и один вызывающий компонент — `useState` в родителе — самое простое
решение. Переходить на глобальный менеджер, когда:

- модалку нужно открывать из нескольких несвязанных мест (не только из компонента, где она
  отрендерена — например, из перехватчика ошибок API или из другой ветки дерева);
- нужен стек модалок (модалка над модалкой);
- нужно открыть модалку императивно за пределами React-дерева (после успешного запроса и т.п.).

## Рецепт: `useModalStore` + типизированный реестр + `ModalHost`

Не реализовано в шаблоне — добавляется по необходимости.

```ts
// store/useModalStore.ts
type ModalRegistry = {
  confirmDelete: { entityName: string };
  editProfile: undefined;
};

type ModalState = {
  [K in keyof ModalRegistry]?: { open: true; props: ModalRegistry[K] };
};

type ModalStore = {
  modals: ModalState;
  openModal: <K extends keyof ModalRegistry>(key: K, props: ModalRegistry[K]) => void;
  closeModal: (key: keyof ModalRegistry) => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  modals: {},
  openModal: (key, props) =>
    set((state) => ({ modals: { ...state.modals, [key]: { open: true, props } } })),
  closeModal: (key) => set((state) => ({ modals: { ...state.modals, [key]: undefined } })),
}));
```

```tsx
// app/ModalHost.tsx — монтируется один раз в App.tsx, рендерит все активные модалки
export function ModalHost() {
  const modals = useModalStore((state) => state.modals);
  return (
    <>
      {modals.confirmDelete?.open && <ConfirmDeleteModal {...modals.confirmDelete.props} />}
      {modals.editProfile?.open && <EditProfileModal />}
    </>
  );
}
```

Вызов из любого места без пропс-дриллинга: `useModalStore.getState().openModal('confirmDelete', { entityName })`.
`ModalRegistry` — единственное место, которое нужно расширять при добавлении новой модалки;
`openModal`/`closeModal` типизированы по нему, опечатка в ключе не пройдёт компиляцию.
