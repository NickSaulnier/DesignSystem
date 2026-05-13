import { useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Toggle,
} from "@design-system/components";
import type { BrandTheme, ColorScale } from "@design-system/tokens";
import { ExportPanel } from "./ExportPanel.js";

const COLOR_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

interface GalleryProps {
  theme: BrandTheme;
}

export function Gallery({ theme }: GalleryProps) {
  return (
    <div className="gallery">
      <Intro theme={theme} />
      <TypographySection theme={theme} />
      <ColorSection theme={theme} />
      <ButtonSection />
      <BadgeSection />
      <CardSection />
      <FormSection />
      <AlertSection />
      <AvatarSection />
      <ToggleSection />
      <SemanticSection />
      <ExportPanel theme={theme} />
    </div>
  );
}

const TYPE_STEPS = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"] as const;

function TypographySection({ theme }: { theme: BrandTheme }) {
  const sampleHeading = "The quick brown fox";
  const sampleBody    = "Pack my box with five dozen liquor jugs — 1234567890";
  return (
    <section className="gallery__section">
      <h2 className="gallery__section-title">Typography</h2>
      <p className="gallery__section-description">
        Heading family: <code>{theme.typography.fontFamily.heading.split(",")[0]}</code>.
        Body family: <code>{theme.typography.fontFamily.body.split(",")[0]}</code>.
      </p>

      <div className="type-scale">
        {TYPE_STEPS.map((step) => (
          <div key={step} className="type-scale__row">
            <div className="type-scale__step">{step}</div>
            <div
              className="type-scale__sample"
              style={{
                fontSize:   `var(--ds-text-${step}-size)`,
                lineHeight: `var(--ds-text-${step}-line-height)`,
                fontFamily: step === "xs" || step === "sm" ? "var(--ds-font-body)" : "var(--ds-font-heading)",
                fontWeight: step === "xs" || step === "sm" ? "var(--ds-weight-normal)" : "var(--ds-weight-bold)",
                letterSpacing: "var(--ds-letter-spacing-tight)",
              }}
            >
              {step === "xs" || step === "sm" ? sampleBody : sampleHeading}
            </div>
          </div>
        ))}
      </div>

      <div className="gallery__row">
        <span style={{ fontWeight: "var(--ds-weight-normal)" }}>Normal {theme.typography.weight.normal}</span>
        <span style={{ fontWeight: "var(--ds-weight-medium)" }}>Medium {theme.typography.weight.medium}</span>
        <span style={{ fontWeight: "var(--ds-weight-bold)"   }}>Bold {theme.typography.weight.bold}</span>
      </div>
    </section>
  );
}

function AlertSection() {
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const tones = [
    { tone: "info"    as const, title: "Heads up",             body: "A new version of the dashboard is available." },
    { tone: "success" as const, title: "Saved successfully",    body: "Your changes have been published to production." },
    { tone: "warning" as const, title: "Approaching usage cap", body: "You have used 82% of your monthly request quota." },
    { tone: "error"   as const, title: "Action required",       body: "We couldn't process your last payment. Please update billing." },
  ];

  return (
    <section className="gallery__section">
      <h2 className="gallery__section-title">Alerts</h2>
      <p className="gallery__section-description">
        Four tones — each tints background + border via the matching semantic color.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-sm)" }}>
        {tones.map(({ tone, title, body }) =>
          dismissed[tone] ? null : (
            <Alert
              key={tone}
              tone={tone}
              title={title}
              icon={tone === "success" ? "✓" : tone === "warning" ? "⚠" : tone === "error" ? "✕" : "ⓘ"}
              onDismiss={() => setDismissed((d) => ({ ...d, [tone]: true }))}
            >
              {body}
            </Alert>
          ),
        )}
        {Object.keys(dismissed).length > 0 && (
          <div>
            <Button size="sm" variant="ghost" onClick={() => setDismissed({})}>
              Restore dismissed
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function AvatarSection() {
  return (
    <section className="gallery__section">
      <h2 className="gallery__section-title">Avatars</h2>
      <p className="gallery__section-description">
        Four sizes; circle or square; falls back to initials when no image source is provided.
      </p>

      <div className="gallery__row">
        <Avatar size="sm" name="Ada Lovelace" />
        <Avatar size="md" name="Marie Curie" />
        <Avatar size="lg" name="Katherine Johnson" />
        <Avatar size="xl" name="Grace Hopper" />
      </div>

      <div className="gallery__row">
        <Avatar size="md" name="Ada Lovelace" shape="square" />
        <Avatar size="md" name="Marie Curie"  shape="square" />
        <Avatar size="md" name="Katherine Johnson" shape="square" />
        <Avatar size="md" name="Grace Hopper" shape="square" />
      </div>
    </section>
  );
}

function ToggleSection() {
  const [notifications, setNotifications] = useState(true);
  const [marketing, setMarketing]         = useState(false);
  const [analytics, setAnalytics]         = useState(true);
  return (
    <section className="gallery__section">
      <h2 className="gallery__section-title">Toggles</h2>
      <p className="gallery__section-description">
        Switch component — exercises the primary color and motion tokens.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-md)" }}>
        <Toggle
          checked={notifications}
          onChange={setNotifications}
          label="Email notifications"
        />
        <Toggle
          checked={marketing}
          onChange={setMarketing}
          label="Marketing updates"
        />
        <Toggle
          checked={analytics}
          onChange={setAnalytics}
          label="Anonymous analytics"
          size="sm"
        />
        <Toggle checked={true} onChange={() => {}} label="Locked on" disabled />
      </div>
    </section>
  );
}

function Intro({ theme }: { theme: BrandTheme }) {
  return (
    <section className="gallery__intro">
      <h1>{theme.identity.name}</h1>
      <p>{theme.identity.description}</p>
      <div className="gallery__row">
        {theme.identity.personality.map((trait) => (
          <Badge key={trait} variant="soft" tone="primary">
            {trait}
          </Badge>
        ))}
      </div>
    </section>
  );
}

function ColorSection({ theme }: { theme: BrandTheme }) {
  return (
    <section className="gallery__section">
      <h2 className="gallery__section-title">Color</h2>
      <p className="gallery__section-description">
        Three core palettes — primary, secondary, neutral — generated from a single seed each.
      </p>
      <PaletteRow label="Primary"   scale={theme.color.primary}   />
      <PaletteRow label="Secondary" scale={theme.color.secondary} />
      <PaletteRow label="Neutral"   scale={theme.color.neutral}   />
    </section>
  );
}

function PaletteRow({ label, scale }: { label: string; scale: ColorScale }) {
  return (
    <div>
      <div className="palette__row-label">{label}</div>
      <div className="palette">
        {COLOR_STOPS.map((stop) => {
          const hex = scale[stop];
          return (
            <div
              key={stop}
              className="palette__swatch"
              style={{ background: hex, color: stop >= 500 ? "white" : "black" }}
              title={`${label} ${stop} · ${hex}`}
            >
              {stop}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ButtonSection() {
  return (
    <section className="gallery__section">
      <h2 className="gallery__section-title">Buttons</h2>
      <p className="gallery__section-description">
        Four variants, three sizes. Exercise the primary color, radius, shadow, and motion tokens.
      </p>

      <div className="gallery__row">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </div>

      <div className="gallery__row">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    </section>
  );
}

function BadgeSection() {
  const tones = ["neutral", "primary", "secondary", "success", "warning", "error", "info"] as const;
  return (
    <section className="gallery__section">
      <h2 className="gallery__section-title">Badges</h2>
      <p className="gallery__section-description">
        Three variants × seven tones — shows the breadth of the palette and semantic colors at a glance.
      </p>

      <div className="gallery__row">
        {tones.map((tone) => (
          <Badge key={tone} variant="solid" tone={tone}>{tone}</Badge>
        ))}
      </div>
      <div className="gallery__row">
        {tones.map((tone) => (
          <Badge key={tone} variant="soft" tone={tone}>{tone}</Badge>
        ))}
      </div>
      <div className="gallery__row">
        {tones.map((tone) => (
          <Badge key={tone} variant="outline" tone={tone}>{tone}</Badge>
        ))}
      </div>
    </section>
  );
}

function CardSection() {
  return (
    <section className="gallery__section">
      <h2 className="gallery__section-title">Cards</h2>
      <p className="gallery__section-description">
        Surface hierarchy, radius, and shadow at three elevations.
      </p>

      <div className="gallery__grid">
        <Card elevation="flat">
          <CardHeader>
            <CardTitle>Flat</CardTitle>
            <CardDescription>No shadow — sits flush with the surface.</CardDescription>
          </CardHeader>
          <CardBody>
            <p>Used for grouped content that doesn't need lift.</p>
          </CardBody>
          <CardFooter>
            <Button size="sm" variant="ghost">Action</Button>
          </CardFooter>
        </Card>

        <Card elevation="elevated">
          <CardHeader>
            <CardTitle>Elevated</CardTitle>
            <CardDescription>Default card style with medium shadow.</CardDescription>
          </CardHeader>
          <CardBody>
            <p>Most cards in the app use this elevation. Balanced lift and density.</p>
          </CardBody>
          <CardFooter>
            <Button size="sm" variant="primary">Primary</Button>
          </CardFooter>
        </Card>

        <Card elevation="floating" interactive>
          <CardHeader>
            <CardTitle>Floating (interactive)</CardTitle>
            <CardDescription>Hover to see the shadow grow.</CardDescription>
          </CardHeader>
          <CardBody>
            <p>Used for modal-like emphasis or clickable cards.</p>
          </CardBody>
          <CardFooter>
            <Badge variant="solid" tone="primary">Featured</Badge>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}

function FormSection() {
  const [email, setEmail] = useState("");
  const [name, setName]   = useState("");
  const showError = email.length > 0 && !email.includes("@");

  return (
    <section className="gallery__section">
      <h2 className="gallery__section-title">Forms</h2>
      <p className="gallery__section-description">
        Input surface, border, focus, hint, and error states.
      </p>

      <div className="gallery__form">
        <Input
          label="Full name"
          placeholder="Ada Lovelace"
          value={name}
          onChange={(e) => setName(e.target.value)}
          hint="As shown on your account"
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={showError ? "Must include an @ sign" : undefined}
        />
        <Input
          label="Disabled field"
          value="locked"
          disabled
          hint="Cannot be edited"
        />
        <div className="gallery__row">
          <Button variant="primary">Submit</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </div>
    </section>
  );
}

function SemanticSection() {
  return (
    <section className="gallery__section">
      <h2 className="gallery__section-title">Semantic Surfaces</h2>
      <p className="gallery__section-description">
        How the same Card composes with badge tones to communicate status.
      </p>

      <div className="gallery__grid">
        <Card>
          <CardHeader>
            <div className="gallery__row" style={{ justifyContent: "space-between", width: "100%" }}>
              <CardTitle as="h4">Deploy succeeded</CardTitle>
              <Badge variant="solid" tone="success">live</Badge>
            </div>
            <CardDescription>Version 2.1.4 is now serving 100% of traffic.</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="gallery__row" style={{ justifyContent: "space-between", width: "100%" }}>
              <CardTitle as="h4">Quota approaching limit</CardTitle>
              <Badge variant="solid" tone="warning">82%</Badge>
            </div>
            <CardDescription>You have used 8,200 of your 10,000 monthly requests.</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="gallery__row" style={{ justifyContent: "space-between", width: "100%" }}>
              <CardTitle as="h4">Payment failed</CardTitle>
              <Badge variant="solid" tone="error">action required</Badge>
            </div>
            <CardDescription>Your card was declined. Update billing to continue service.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}
