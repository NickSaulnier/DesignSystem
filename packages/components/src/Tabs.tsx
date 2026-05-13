import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import clsx from "clsx";

export type TabsOrientation = "horizontal" | "vertical";
export type TabsVariant     = "underline" | "pill";

interface TabsContextValue {
  value:        string;
  setValue:     (next: string) => void;
  baseId:       string;
  orientation:  TabsOrientation;
  variant:      TabsVariant;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`<${component}> must be rendered inside <Tabs>.`);
  return ctx;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Controlled selected tab value. */
  value?:         string;
  /** Initial selected tab. Used when uncontrolled. */
  defaultValue?:  string;
  /** Called when the selection changes. */
  onChange?:      (next: string) => void;
  orientation?:   TabsOrientation;
  variant?:       TabsVariant;
  children:       ReactNode;
}

/**
 * Tabbed disclosure with WAI-ARIA semantics.
 *
 * Composition:
 *   <Tabs defaultValue="one">
 *     <TabList>
 *       <Tab value="one">One</Tab>
 *       <Tab value="two">Two</Tab>
 *     </TabList>
 *     <TabPanel value="one">…</TabPanel>
 *     <TabPanel value="two">…</TabPanel>
 *   </Tabs>
 *
 * Keyboard:
 * - ArrowLeft / ArrowRight (or Up/Down when vertical) — move focus between tabs
 * - Home / End — first / last tab
 * - Activates on focus (automatic activation per WAI-ARIA Authoring Practices)
 */
export function Tabs({
  value:        controlledValue,
  defaultValue,
  onChange,
  orientation = "horizontal",
  variant     = "underline",
  className,
  children,
  ...rest
}: TabsProps) {
  const baseId = useId();
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(defaultValue ?? "");

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolledValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const ctx = useMemo<TabsContextValue>(
    () => ({ value, setValue, baseId, orientation, variant }),
    [value, setValue, baseId, orientation, variant],
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div
        className={clsx("ds-tabs", `ds-tabs--${orientation}`, `ds-tabs--${variant}`, className)}
        {...rest}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// ----- TabList ---------------------------------------------------------------

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  ariaLabel?: string;
}

export function TabList({ className, ariaLabel, children, ...rest }: TabListProps) {
  const ctx = useTabsContext("TabList");
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={ctx.orientation}
      className={clsx("ds-tabs__list", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

// ----- Tab -------------------------------------------------------------------

export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
}

export function Tab({ value, className, onKeyDown, children, ...rest }: TabProps) {
  const ctx = useTabsContext("Tab");
  const selected = ctx.value === value;
  const tabId    = `${ctx.baseId}-tab-${value}`;
  const panelId  = `${ctx.baseId}-panel-${value}`;

  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      className={clsx("ds-tabs__tab", selected && "ds-tabs__tab--selected", className)}
      onClick={() => ctx.setValue(value)}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        const horizontal = ctx.orientation === "horizontal";
        const prevKey = horizontal ? "ArrowLeft"  : "ArrowUp";
        const nextKey = horizontal ? "ArrowRight" : "ArrowDown";
        if (!["Home", "End", prevKey, nextKey].includes(e.key)) return;
        e.preventDefault();
        const list = (e.currentTarget.parentElement as HTMLElement | null);
        if (!list) return;
        const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>("[role='tab']"));
        const idx  = tabs.indexOf(e.currentTarget);
        let nextIdx = idx;
        if (e.key === "Home")    nextIdx = 0;
        if (e.key === "End")     nextIdx = tabs.length - 1;
        if (e.key === prevKey)   nextIdx = (idx - 1 + tabs.length) % tabs.length;
        if (e.key === nextKey)   nextIdx = (idx + 1) % tabs.length;
        const next = tabs[nextIdx];
        if (next) {
          next.focus();
          // Automatic activation — selection follows focus for tabs.
          next.click();
        }
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

// ----- TabPanel --------------------------------------------------------------

export interface TabPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "value"> {
  value: string;
  /** Keep the panel mounted when not selected. Useful for preserving form state. */
  keepMounted?: boolean;
}

export function TabPanel({
  value,
  keepMounted,
  className,
  children,
  ...rest
}: TabPanelProps) {
  const ctx = useTabsContext("TabPanel");
  const selected = ctx.value === value;
  const tabId    = `${ctx.baseId}-tab-${value}`;
  const panelId  = `${ctx.baseId}-panel-${value}`;

  if (!selected && !keepMounted) return null;

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      tabIndex={0}
      hidden={!selected}
      className={clsx("ds-tabs__panel", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
