import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import clsx from "clsx";

export type MenuPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

interface MenuContextValue {
  open:        boolean;
  setOpen:     (next: boolean) => void;
  triggerId:   string;
  menuId:      string;
  placement:   MenuPlacement;
  // Use a structural type rather than RefObject so we can mutate `.current`
  // from forwarded refs. MutableRefObject's name is gone in newer @types/react.
  triggerRef:  { current: HTMLButtonElement | null };
  menuRef:     { current: HTMLDivElement | null };
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext(component: string): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error(`<${component}> must be rendered inside <Menu>.`);
  return ctx;
}

export interface MenuProps {
  children:    ReactNode;
  placement?:  MenuPlacement;
  /** Controlled open state. If omitted, the menu is uncontrolled. */
  open?:       boolean;
  onOpenChange?: (next: boolean) => void;
}

/**
 * Click-triggered menu / dropdown.
 *
 * Composition mirrors `Card`:
 *   <Menu>
 *     <MenuTrigger>Open</MenuTrigger>
 *     <MenuContent>
 *       <MenuItem onSelect={...}>One</MenuItem>
 *       <MenuSeparator />
 *       <MenuItem onSelect={...}>Two</MenuItem>
 *     </MenuContent>
 *   </Menu>
 *
 * Keyboard:
 * - Enter / Space on trigger to toggle
 * - Esc to close
 * - ArrowUp / ArrowDown to navigate items when open
 * - Enter on focused item to select
 */
export function Menu({
  children,
  placement = "bottom-start",
  open: controlledOpen,
  onOpenChange,
}: MenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef    = useRef<HTMLDivElement | null>(null);
  const triggerId  = useId();
  const menuId     = useId();

  const isControlled = controlledOpen !== undefined;
  const open  = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (menuRef.current?.contains(target))    return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, setOpen]);

  // Close on Escape and return focus to the trigger.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  const ctx: MenuContextValue = {
    open,
    setOpen,
    triggerId,
    menuId,
    placement,
    triggerRef,
    menuRef,
  };

  return (
    <MenuContext.Provider value={ctx}>
      <span className="ds-menu">{children}</span>
    </MenuContext.Provider>
  );
}

// ----- Trigger --------------------------------------------------------------

export interface MenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const MenuTrigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(
  function MenuTrigger({ className, type = "button", onClick, onKeyDown, children, ...rest }, ref) {
    const ctx = useMenuContext("MenuTrigger");

    return (
      <button
        ref={(node) => {
          ctx.triggerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as { current: HTMLButtonElement | null }).current = node;
        }}
        id={ctx.triggerId}
        type={type}
        aria-haspopup="menu"
        aria-expanded={ctx.open}
        aria-controls={ctx.open ? ctx.menuId : undefined}
        className={clsx("ds-menu__trigger", className)}
        onClick={(e) => {
          onClick?.(e);
          ctx.setOpen(!ctx.open);
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            ctx.setOpen(true);
            // Focus first menu item once mounted.
            window.setTimeout(() => {
              const first = ctx.menuRef.current?.querySelector<HTMLElement>(
                "[role='menuitem']:not([aria-disabled='true'])",
              );
              first?.focus();
            }, 0);
          }
        }}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

// ----- Content --------------------------------------------------------------

export interface MenuContentProps extends HTMLAttributes<HTMLDivElement> {}

export function MenuContent({ className, children, onKeyDown, ...rest }: MenuContentProps) {
  const ctx = useMenuContext("MenuContent");

  if (!ctx.open) return null;

  return (
    <div
      ref={ctx.menuRef}
      id={ctx.menuId}
      role="menu"
      aria-labelledby={ctx.triggerId}
      className={clsx("ds-menu__content", `ds-menu__content--${ctx.placement}`, className)}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        e.preventDefault();
        const items = Array.from(
          ctx.menuRef.current?.querySelectorAll<HTMLElement>(
            "[role='menuitem']:not([aria-disabled='true'])",
          ) ?? [],
        );
        if (items.length === 0) return;
        const idx = items.indexOf(document.activeElement as HTMLElement);
        const next = e.key === "ArrowDown"
          ? items[(idx + 1) % items.length]
          : items[(idx - 1 + items.length) % items.length];
        next?.focus();
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

// ----- Item -----------------------------------------------------------------

export interface MenuItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> {
  /** Called when the item is activated (click or Enter key). */
  onSelect?: () => void;
  /** When true, the item is rendered but not interactive. */
  disabled?: boolean;
}

export function MenuItem({
  onSelect,
  disabled,
  className,
  children,
  onClick,
  onKeyDown,
  ...rest
}: MenuItemProps) {
  const ctx = useMenuContext("MenuItem");

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      className={clsx("ds-menu__item", className)}
      onClick={(e) => {
        onClick?.(e);
        if (disabled) return;
        onSelect?.();
        ctx.setOpen(false);
        ctx.triggerRef.current?.focus();
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key === "Enter" || e.key === " ") {
          if (disabled) return;
          e.preventDefault();
          onSelect?.();
          ctx.setOpen(false);
          ctx.triggerRef.current?.focus();
        }
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

// ----- Separator ------------------------------------------------------------

export function MenuSeparator({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={clsx("ds-menu__separator", className)}
      {...rest}
    />
  );
}
