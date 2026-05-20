import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import { AlertDialog as RadixAlertDialog } from "radix-ui";
import { Button } from "@/shared/components/ui/Button";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Promise-returning confirmation — drop-in async replacement for
 * `window.confirm`: `if (await confirm({ title, description })) { ... }`.
 * Requires <ConfirmProvider> mounted above the caller (see app/providers.tsx).
 */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within <ConfirmProvider>");
  }
  return ctx;
}

/**
 * Renders a single shared Radix AlertDialog and exposes `confirm()` via
 * context. AlertDialog (not Dialog) is intentional: role="alertdialog",
 * focus parked on Cancel, no dismiss on overlay click.
 */
export function ConfirmProvider({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  // `options` is kept (not cleared) on close so title/description stay
  // populated through Radix's exit animation — emptying them while Content
  // is still mounted trips the "DialogContent requires a DialogTitle" /
  // "Missing Description" a11y warnings.
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setOptions(opts);
      setOpen(true);
    });
  }, []);

  // Idempotent: the resolver is read-and-cleared, so the second call that
  // Radix fires via onOpenChange after a button click is a harmless no-op.
  const settle = useCallback((ok: boolean) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setOpen(false);
    resolve?.(ok);
  }, []);

  const destructive = options?.variant === "destructive";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <RadixAlertDialog.Root
        open={open}
        onOpenChange={(next) => {
          if (!next) settle(false);
        }}
      >
        <RadixAlertDialog.Portal>
          <RadixAlertDialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <RadixAlertDialog.Content className="fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 gap-2 border border-slate-200 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg">
            <RadixAlertDialog.Title className="text-lg font-semibold text-slate-900">
              {options?.title}
            </RadixAlertDialog.Title>
            {options?.description ? (
              <RadixAlertDialog.Description className="text-sm leading-relaxed text-slate-500">
                {options.description}
              </RadixAlertDialog.Description>
            ) : null}
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <RadixAlertDialog.Cancel asChild>
                <Button type="button" variant="ghost" onClick={() => settle(false)}>
                  {options?.cancelLabel ?? "Anuluj"}
                </Button>
              </RadixAlertDialog.Cancel>
              <RadixAlertDialog.Action asChild>
                <Button
                  type="button"
                  variant={destructive ? "danger" : "primary"}
                  onClick={() => settle(true)}
                >
                  {options?.confirmLabel ?? (destructive ? "Usuń" : "Potwierdź")}
                </Button>
              </RadixAlertDialog.Action>
            </div>
          </RadixAlertDialog.Content>
        </RadixAlertDialog.Portal>
      </RadixAlertDialog.Root>
    </ConfirmContext.Provider>
  );
}
