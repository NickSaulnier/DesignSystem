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
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Progress,
  Select,
  Slider,
  Toggle,
  Tooltip,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Table,
  TableHead,
  TableBody,
  TableFoot,
  TableRow,
  TableHeadCell,
  TableCell,
  Pagination,
  Breadcrumb,
  BreadcrumbItem,
  Skeleton,
} from "@nicksaulnier/design-system-components";
import type { BrandTheme, ColorScale } from "@nicksaulnier/design-system-tokens";
import { ExportPanel } from "./ExportPanel.js";

const COLOR_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

/**
 * Pick black or white text for a swatch based on the swatch's relative luminance.
 * Uses the WCAG luminance formula — same one `wcagContrast` uses internally — so
 * the result is consistent with the contrast logic elsewhere in the system.
 *
 * Threshold of 0.55 (slightly biased toward dark text) matches typical palette
 * label conventions: mid-tones read better with dark text on top.
 */
function swatchTextColor(hex: string): "#000" | "#fff" {
  const rgb = hex.replace("#", "").match(/.{2}/g);
  if (!rgb || rgb.length < 3) return "#000";
  const [r, g, b] = rgb.slice(0, 3).map((c) => {
    const v = parseInt(c, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.55 ? "#000" : "#fff";
}

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
      <FormExpansionsSection />
      <OverlaySection />
      <NavigationDataSection />
      <SemanticSection />
      <ExportPanel theme={theme} />
    </div>
  );
}

function FormExpansionsSection() {
  const [country, setCountry]   = useState("");
  const [priority, setPriority] = useState("normal");
  const [volume, setVolume]     = useState(40);
  const [zoom, setZoom]         = useState(1.5);

  return (
    <section className="gallery__section">
      <h2 className="gallery__section-title">Form expansions</h2>
      <p className="gallery__section-description">
        Select, Slider, and Progress — driven by the same primary, surface, and motion tokens
        as the rest of the form components.
      </p>

      <div className="gallery__form">
        <Select
          label="Country"
          placeholder="Select a country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          options={[
            { value: "us", label: "United States" },
            { value: "ca", label: "Canada" },
            { value: "uk", label: "United Kingdom" },
            { value: "jp", label: "Japan" },
            { value: "de", label: "Germany" },
          ]}
          hint={country ? `Selected: ${country.toUpperCase()}` : "Required for tax calculation"}
        />

        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          size="sm"
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </Select>

        <Slider
          label="Volume"
          value={volume}
          onChange={setVolume}
          min={0}
          max={100}
          formatValue={(v) => `${v}%`}
          hint="Use arrow keys for fine adjustment"
        />

        <Slider
          label="Zoom"
          value={zoom}
          onChange={setZoom}
          min={0.5}
          max={3}
          step={0.1}
          size="sm"
          formatValue={(v) => `${v.toFixed(1)}×`}
        />
      </div>

      <div style={{ marginTop: "var(--ds-space-lg)", display: "flex", flexDirection: "column", gap: "var(--ds-space-md)" }}>
        <Progress value={volume} max={100} label="Upload" tone="primary" showValue />
        <Progress value={72}     max={100} label="Storage used" tone="warning" showValue />
        <Progress value={100}    max={100} label="Sync complete" tone="success" showValue />
        <Progress label="Connecting…" />
      </div>
    </section>
  );
}

function NavigationDataSection() {
  const [page, setPage]       = useState(3);
  const [sortKey, setSortKey] = useState<"name" | "users" | "revenue">("revenue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const rows = [
    { name: "Atlas",   users: 1240, revenue: 18900 },
    { name: "Beacon",  users: 870,  revenue: 9100  },
    { name: "Compass", users: 2310, revenue: 41200 },
    { name: "Drift",   users: 530,  revenue: 4400  },
    { name: "Ember",   users: 1820, revenue: 26500 },
  ];

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (av === bv) return 0;
    const cmp = av < bv ? -1 : 1;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const handleSort = (key: typeof sortKey) => {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const dir = (key: typeof sortKey) => (key === sortKey ? sortDir : undefined);

  return (
    <section className="gallery__section">
      <h2 className="gallery__section-title">Navigation &amp; data</h2>
      <p className="gallery__section-description">
        Tabs, Breadcrumb, Table, Pagination, and Skeleton — the higher-density display components.
      </p>

      <Breadcrumb separator="›">
        <BreadcrumbItem href="#">Projects</BreadcrumbItem>
        <BreadcrumbItem href="#">Acme</BreadcrumbItem>
        <BreadcrumbItem href="#">Reports</BreadcrumbItem>
        <BreadcrumbItem current>Q3 Summary</BreadcrumbItem>
      </Breadcrumb>

      <Tabs defaultValue="overview">
        <TabList ariaLabel="Project sections">
          <Tab value="overview">Overview</Tab>
          <Tab value="activity">Activity</Tab>
          <Tab value="settings">Settings</Tab>
          <Tab value="billing">Billing</Tab>
        </TabList>
        <TabPanel value="overview">
          <p>The Overview tab shows the high-level metrics for this project. Tabs use the underline variant by default and auto-activate on focus per WAI-ARIA Authoring Practices.</p>
        </TabPanel>
        <TabPanel value="activity">
          <p>Activity feed would appear here — recent commits, comments, and deploys.</p>
        </TabPanel>
        <TabPanel value="settings">
          <p>Project settings: name, visibility, access roles.</p>
        </TabPanel>
        <TabPanel value="billing">
          <p>Plan details and invoices. Click between tabs with the mouse, or use ArrowLeft / ArrowRight to navigate.</p>
        </TabPanel>
      </Tabs>

      <Tabs defaultValue="day" variant="pill">
        <TabList ariaLabel="Time range">
          <Tab value="day">Day</Tab>
          <Tab value="week">Week</Tab>
          <Tab value="month">Month</Tab>
          <Tab value="year">Year</Tab>
        </TabList>
        <TabPanel value="day"><span style={{ color: "var(--ds-text-secondary)" }}>Pill variant — same component, different appearance.</span></TabPanel>
        <TabPanel value="week"><span style={{ color: "var(--ds-text-secondary)" }}>Week summary placeholder.</span></TabPanel>
        <TabPanel value="month"><span style={{ color: "var(--ds-text-secondary)" }}>Month summary placeholder.</span></TabPanel>
        <TabPanel value="year"><span style={{ color: "var(--ds-text-secondary)" }}>Year summary placeholder.</span></TabPanel>
      </Tabs>

      <Table striped hoverable>
        <TableHead>
          <TableRow>
            <TableHeadCell
              sortDirection={dir("name")}
              onClick={() => handleSort("name")}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              Project
            </TableHeadCell>
            <TableHeadCell
              align="right"
              sortDirection={dir("users")}
              onClick={() => handleSort("users")}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              Users
            </TableHeadCell>
            <TableHeadCell
              align="right"
              sortDirection={dir("revenue")}
              onClick={() => handleSort("revenue")}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              Revenue
            </TableHeadCell>
            <TableHeadCell align="right">Actions</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((r) => (
            <TableRow key={r.name}>
              <TableCell>{r.name}</TableCell>
              <TableCell align="right">{r.users.toLocaleString()}</TableCell>
              <TableCell align="right">${r.revenue.toLocaleString()}</TableCell>
              <TableCell align="right">
                <Button size="sm" variant="ghost">Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFoot>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell align="right">{rows.reduce((s, r) => s + r.users, 0).toLocaleString()}</TableCell>
            <TableCell align="right">${rows.reduce((s, r) => s + r.revenue, 0).toLocaleString()}</TableCell>
            <TableCell />
          </TableRow>
        </TableFoot>
      </Table>

      <Pagination page={page} totalPages={20} onChange={setPage} />

      <div>
        <p className="gallery__section-description" style={{ marginBottom: "var(--ds-space-sm)" }}>
          Skeleton — loading placeholders. Animation respects <code>prefers-reduced-motion</code>.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-md)" }}>
          <Skeleton shape="circle" />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--ds-space-xs)" }}>
            <Skeleton shape="text" width="60%" height="1.25rem" />
            <Skeleton shape="text" width="40%" />
            <Skeleton shape="text" width="80%" />
          </div>
        </div>
        <Skeleton shape="rect" height="6rem" style={{ marginTop: "var(--ds-space-md)" }} />
      </div>
    </section>
  );
}

function OverlaySection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [lastChoice, setLastChoice] = useState<string | null>(null);

  return (
    <section className="gallery__section">
      <h2 className="gallery__section-title">Overlays</h2>
      <p className="gallery__section-description">
        Modal, Tooltip, and Menu — portal-rendered overlays driven by the same tokens.
      </p>

      <div className="gallery__row">
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          Open modal
        </Button>

        <Tooltip content="Tooltips show on hover or focus" placement="top">
          <Button variant="secondary">Hover me (top)</Button>
        </Tooltip>

        <Tooltip content="Right-side placement" placement="right">
          <Button variant="ghost">Hover me (right)</Button>
        </Tooltip>

        <Menu>
          <MenuTrigger>Actions ▾</MenuTrigger>
          <MenuContent>
            <MenuItem onSelect={() => setLastChoice("Rename")}>Rename</MenuItem>
            <MenuItem onSelect={() => setLastChoice("Duplicate")}>Duplicate</MenuItem>
            <MenuItem onSelect={() => setLastChoice("Archive")}>Archive</MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={() => setLastChoice("Delete")}>Delete</MenuItem>
            <MenuItem disabled>Disabled item</MenuItem>
          </MenuContent>
        </Menu>

        {lastChoice && (
          <Badge variant="soft" tone="primary">
            Last menu choice: {lastChoice}
          </Badge>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} ariaLabel="Demo modal">
        <ModalHeader>
          <div>
            <ModalTitle>Confirm changes</ModalTitle>
            <ModalDescription>
              This action will apply your edits to the live theme. You can revert from history.
            </ModalDescription>
          </div>
          <ModalCloseButton onClick={() => setModalOpen(false)} />
        </ModalHeader>
        <ModalBody>
          <p>
            Modals trap focus inside their content, dismiss on{" "}
            <code style={{ fontFamily: "var(--ds-font-mono)" }}>Esc</code>, and lock body scroll while open.
            Clicking the backdrop also closes the modal.
          </p>
          <p style={{ marginTop: "var(--ds-space-md)" }}>
            All styling comes from <code style={{ fontFamily: "var(--ds-font-mono)" }}>--ds-*</code> variables —
            shadow, radius, surface, and motion tokens drive the entrance animation.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setModalOpen(false)}>
            Apply
          </Button>
        </ModalFooter>
      </Modal>
    </section>
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
          // Pick text color from the swatch's actual luminance, not its step number.
          // Step ordering reverses in dark mode (50 ↔ 950 etc.), so a step-based
          // heuristic would invert the contrast in the wrong direction.
          const textColor = swatchTextColor(hex);
          return (
            <div
              key={stop}
              className="palette__swatch"
              style={{ background: hex, color: textColor }}
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
