# Modals

## `ModalCore` — parent-owned

The template's only modal component — `ui/components/ModalCore/ModalCore.tsx`, built on
`radix-ui`'s `Dialog`. Fully **parent-owned**: it doesn't hold its own open/closed state —
the parent passes `isOpen`/`setOpen` as props:

```tsx
const [isModalOpen, setModalOpen] = useState(false);

<ModalCore
  isOpen={isModalOpen}
  setOpen={setModalOpen}
  title={t('someModal.title')}
  description={t('someModal.description')}
  confirmAction={() => setModalOpen(false)}
  cancelAction={() => setModalOpen(false)}
/>
```

`setOpen` is passed straight into Radix's `onOpenChange`, so it fires automatically on both an
overlay click and Escape (the focus trap and Escape handling come from Radix, nothing is
implemented by hand).

Props: `isOpen`, `setOpen`, `title?`, `description?`, `confirmAction?`, `cancelAction?`
(buttons are only rendered if an action is passed), `loading?` (spinner on confirm, disables both
buttons), `hasCloseButton?` (defaults to `true`), `confirmText?`/`cancelText?` (otherwise —
the `common.save`/`common.cancel` translations), `children?`.

A modal without a `title` still gets a title in the accessibility tree — a `VisuallyHidden.Root`
with `t('common.close')` — Radix's `Dialog` requires a `Dialog.Title` for screen readers
regardless of whether a title is needed visually.

## When to move to a global manager

While the template has one modal and one calling component, `useState` in the parent is the
simplest solution. Move to a global manager when:

- the modal needs to be opened from several unrelated places (not just from the component
  that renders it — e.g. from an API error interceptor or another branch of the tree);
- a modal stack is needed (a modal over a modal);
- the modal needs to be opened imperatively outside the React tree (after a successful request, etc.).

## Recipe: `useModalStore` + a typed registry + `ModalHost`

Not implemented in the template — add it when needed.

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
// app/ModalHost.tsx — mounted once in App.tsx, renders all active modals
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

Calling it from anywhere with no prop drilling: `useModalStore.getState().openModal('confirmDelete', { entityName })`.
`ModalRegistry` is the only place that needs to be extended when adding a new modal;
`openModal`/`closeModal` are typed against it, so a typo in the key won't compile.
