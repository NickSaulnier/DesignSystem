import { useMemo, useState } from "react";
import { Button, Select } from "@nicksaulnier/design-system-components";
import {
  applyTokenEdits,
  extractEditableSnapshot,
  FONT_PAIRS,
  type BorderCharacter,
  type EditableSnapshot,
  type MotionCharacter,
  type NeutralCast,
  type TokenEdits,
  type VisualMood,
} from "@nicksaulnier/design-system-theme-engine";
import type { BrandTheme } from "@nicksaulnier/design-system-tokens";

interface SettingsPanelProps {
  open:        boolean;
  onClose:     () => void;
  /** The current canonical (light-mode) theme that edits apply to. */
  theme:       BrandTheme;
  /** Called with a fully-edited theme on every change — drives live retoning. */
  onApply:     (next: BrandTheme) => void;
}

const NEUTRAL_CASTS: NeutralCast[] = ["warm", "cool", "pure"];
const BORDER_OPTIONS: BorderCharacter[] = ["sharp", "slightly-rounded", "rounded", "pill"];
const VISUAL_MOODS: VisualMood[] = ["minimal", "structured", "expressive", "organic"];
const MOTION_OPTIONS: MotionCharacter[] = ["snappy", "smooth", "minimal", "expressive"];

export function SettingsPanel({ open, onClose, theme, onApply }: SettingsPanelProps) {
  // The current snapshot reflects the live theme — we never need to "save" because
  // edits go straight to App state. But we DO snapshot the original on first open
  // so the Reset button has a target to return to.
  const initial: EditableSnapshot = useMemo(() => extractEditableSnapshot(theme), [theme]);
  const [openedFrom, setOpenedFrom] = useState<BrandTheme | null>(null);

  // First-open: remember the theme we started editing from. We reset on re-open.
  if (open && openedFrom === null) {
    setOpenedFrom(theme);
  } else if (!open && openedFrom !== null) {
    // Closed — clear so next open snapshots fresh.
    setOpenedFrom(null);
  }

  const applyEdit = (edit: TokenEdits) => {
    onApply(applyTokenEdits(theme, edit));
  };

  const handleReset = () => {
    if (openedFrom) onApply(openedFrom);
  };

  return (
    <aside
      className={`settings-panel${open ? " settings-panel--open" : ""}`}
      aria-hidden={!open}
      aria-label="Customize tokens"
    >
      <header className="settings-panel__header">
        <div>
          <h2 className="settings-panel__title">Customize tokens</h2>
          <p className="settings-panel__subtitle">
            Hand-tune any of Claude's choices. Edits are local — no API call.
          </p>
        </div>
        <button
          type="button"
          className="settings-panel__close"
          aria-label="Close settings"
          onClick={onClose}
        >
          ×
        </button>
      </header>

      <div className="settings-panel__body">
        <Section title="Color seeds">
          <ColorField
            label="Primary"
            value={initial.primarySeed}
            onChange={(v) => applyEdit({ primarySeed: v })}
          />
          <ColorField
            label="Secondary"
            value={initial.secondarySeed}
            onChange={(v) => applyEdit({ secondarySeed: v })}
          />
          <Select
            label="Neutral cast"
            value={initial.neutralCast === "unknown" ? "" : initial.neutralCast}
            onChange={(e) => applyEdit({ neutralCast: e.target.value as NeutralCast })}
            options={NEUTRAL_CASTS.map((c) => ({ value: c, label: titleCase(c) }))}
            placeholder={initial.neutralCast === "unknown" ? "Custom" : undefined}
          />
        </Section>

        <Section title="Semantic colors">
          <ColorField
            label="Success"
            value={initial.semanticSuccess}
            onChange={(v) => applyEdit({ semanticSuccess: v })}
          />
          <ColorField
            label="Warning"
            value={initial.semanticWarning}
            onChange={(v) => applyEdit({ semanticWarning: v })}
          />
          <ColorField
            label="Error"
            value={initial.semanticError}
            onChange={(v) => applyEdit({ semanticError: v })}
          />
          <ColorField
            label="Info"
            value={initial.semanticInfo}
            onChange={(v) => applyEdit({ semanticInfo: v })}
          />
        </Section>

        <Section title="Characteristics">
          <Select
            label="Border character"
            value={initial.borderCharacter === "unknown" ? "" : initial.borderCharacter}
            onChange={(e) => applyEdit({ borderCharacter: e.target.value as BorderCharacter })}
            options={BORDER_OPTIONS.map((b) => ({ value: b, label: titleCase(b) }))}
            placeholder={initial.borderCharacter === "unknown" ? "Custom" : undefined}
          />
          <Select
            label="Visual mood"
            value={initial.visualMood === "unknown" ? "" : initial.visualMood}
            onChange={(e) => applyEdit({ visualMood: e.target.value as VisualMood })}
            options={VISUAL_MOODS.map((v) => ({ value: v, label: titleCase(v) }))}
            placeholder={initial.visualMood === "unknown" ? "Custom" : undefined}
          />
          <Select
            label="Motion character"
            value={initial.motionCharacter === "unknown" ? "" : initial.motionCharacter}
            onChange={(e) => applyEdit({ motionCharacter: e.target.value as MotionCharacter })}
            options={MOTION_OPTIONS.map((m) => ({ value: m, label: titleCase(m) }))}
            placeholder={initial.motionCharacter === "unknown" ? "Custom" : undefined}
          />
        </Section>

        <Section title="Typography">
          <Select
            label="Font pair"
            value={initial.fontPairId === "unknown" ? "" : initial.fontPairId}
            onChange={(e) => applyEdit({ fontPairId: e.target.value })}
            options={FONT_PAIRS.map((p) => ({ value: p.id, label: p.id }))}
            placeholder={initial.fontPairId === "unknown" ? "Custom" : undefined}
            hint="The catalog of 10 curated pairs. Selecting one replaces heading + body fonts."
          />
        </Section>
      </div>

      <footer className="settings-panel__footer">
        <Button variant="ghost" onClick={handleReset}>
          Reset to opened state
        </Button>
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      </footer>
    </aside>
  );
}

// ----- Local primitives -----------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="settings-panel__section">
      <h3 className="settings-panel__section-title">{title}</h3>
      <div className="settings-panel__fields">{children}</div>
    </section>
  );
}

interface ColorFieldProps {
  label:    string;
  value:    string;
  onChange: (value: string) => void;
}

function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <label className="settings-panel__color-field">
      <span className="settings-panel__color-label">{label}</span>
      <span className="settings-panel__color-controls">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="settings-panel__color-swatch"
          aria-label={`${label} color`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value.trim();
            if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
            else if (v.startsWith("#") && v.length <= 7) onChange(v); // allow in-progress typing
          }}
          className="settings-panel__color-hex"
          spellCheck={false}
        />
      </span>
    </label>
  );
}

function titleCase(s: string): string {
  return s
    .split(/[-_\s]+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}
