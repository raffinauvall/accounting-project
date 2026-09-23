# Finance Viewer — Design Direction

## Design reference

Use the Behance project **AI Finance Management SaaS — UX/UI Dashboard Design** as visual inspiration only.

Reference: https://www.behance.net/gallery/234937291/AI-Finance-Management-SaaS-UX-UI-DashboardDesign

Do not copy the reference screen pixel-for-pixel. Preserve the same premium, clean, modern fintech feeling while adapting the information architecture to this product.

## Product context

This is a web-based finance viewer for viewing financial reports generated from a Chart of Accounts (COA). The user enters or imports COA transaction/account numbers, and the system organizes them into:

- Dashboard overview
- Chart of Accounts
- Neraca / Balance Sheet
- Laporan Laba Rugi / Income Statement
- Cash flow
- Transaction details

The first version does not need login, user management, or complex accounting administration.

## Visual direction

- Premium SaaS fintech dashboard.
- Calm, trustworthy, and data-focused.
- Generous whitespace and clear visual hierarchy.
- Light neutral background with white cards.
- Dark navy or charcoal text.
- Use one strong emerald/teal accent for positive financial states and primary actions.
- Use muted red only for losses, liabilities, errors, or negative trends.
- Rounded cards and controls, but avoid excessive pill-shaped UI.
- Soft borders and very subtle shadows; never make the interface look glossy or childish.
- Charts should feel lightweight and editorial, not like a crowded analytics tool.

## Suggested color tokens

```css
--background: #F6F8F7;
--surface: #FFFFFF;
--surface-muted: #EEF3F1;
--text-primary: #17211F;
--text-secondary: #6D7975;
--border: #E2E9E6;
--accent: #0F8B6D;
--accent-dark: #087055;
--accent-soft: #DDF4EC;
--negative: #D95C5C;
--negative-soft: #FCE8E8;
--warning: #C98932;
```

The exact colors can be adjusted after implementation, but maintain a restrained palette and strong contrast.

## Typography

Use a modern sans-serif such as Inter, Geist, Manrope, or Plus Jakarta Sans.

- Page title: bold, compact, approximately 28–36px.
- Section title: 18–22px, semibold.
- Card metric: 24–32px, bold.
- Body text: 14–16px.
- Table text: 13–14px.
- Use tabular numerals for currency and accounting values.
- Keep labels short and readable; do not use all-caps text except for tiny metadata.

## Layout

Use a desktop-first dashboard layout that remains responsive:

1. Fixed or sticky left sidebar, approximately 240–264px wide.
2. Main content area with a maximum width around 1440px.
3. Top bar containing page title/context, selected period, search, and compact actions.
4. Dashboard content arranged on a 12-column grid.
5. Use 24–32px page padding and 16–24px gaps between cards.
6. On tablet/mobile, collapse the sidebar into a menu and stack cards vertically.

## Navigation

Sidebar items:

- Overview
- Chart of Accounts
- Neraca
- Laba Rugi
- Cash Flow
- Transactions

The active item should use a soft emerald background, dark accent text, and a simple icon. Icons must be consistent in stroke style and must not overpower labels.

## Main dashboard screen

The overview page should contain:

- A welcoming but concise header, for example “Financial overview”.
- Period selector: month, quarter, or year.
- Four summary cards: Total Assets, Total Liabilities, Revenue, and Net Profit.
- Each summary card shows the current value, comparison against the previous period, and a very small trend indicator.
- A large Revenue vs Expenses chart as the primary visual.
- A Net Profit trend or cash balance card beside/below it.
- A recent transactions table with date, description, account, category, status, and amount.
- A small “Quick actions” area for importing COA data, adding a transaction, or opening a report.

Do not overload the first screen with every accounting detail. The overview should help a business owner understand the condition of the business within a few seconds.

## Chart of Accounts screen

Provide a clean data-management screen with:

- Page title and short explanatory subtitle.
- Search field and filters for account type/category.
- Primary action: “Add account” or “Import COA”.
- Table/tree structure showing account code, account name, account type, parent account, and balance.
- Distinguish asset, liability, equity, revenue, and expense with small labels or restrained color accents.
- Support expandable parent accounts if hierarchical COA data is used.
- Make account code easy to scan and copy.

## Financial report screens

Neraca, Laba Rugi, and Cash Flow should share one reusable report layout:

- Report title and selected period.
- Date/period filter and export action.
- Optional comparison toggle for previous period.
- Summary metrics at the top.
- Structured report table with clear indentation for parent and child accounts.
- Right-aligned numeric columns.
- Bold subtotal and total rows with subtle backgrounds or dividers.
- Positive/negative values should be readable without relying only on color.
- Add a compact chart only where it improves understanding; the table remains the main source of truth.

## Components

Create reusable components before composing pages:

- App shell
- Sidebar navigation
- Top bar
- Metric card
- Trend badge
- Period selector
- Search input
- Filter dropdown
- Primary/secondary button
- Status badge
- Chart card
- Financial report table
- Transaction table
- Empty state
- Import COA modal
- Confirmation modal
- Toast notification

Use consistent component states: default, hover, focus, active, disabled, loading, empty, and error.

## Interaction principles

- Important actions should be visible and have clear labels.
- Use progressive disclosure for complex accounting details.
- Confirm destructive actions such as deleting an account or transaction.
- Show loading skeletons for cards, charts, and tables.
- Show useful empty states instead of blank panels.
- Use toast feedback after import, save, update, or export.
- Keep filters and selected periods visible so report context is never ambiguous.
- Keyboard focus states must be visible.

## Data presentation rules

- Format currency consistently, preferably Indonesian Rupiah: `Rp 125.000.000`.
- Use consistent decimal and thousands separators.
- Align all amounts to the right.
- Use parentheses or a minus sign for negative accounting values, but apply one convention consistently.
- Never communicate financial meaning through color alone.
- Avoid unnecessary decimal places in summary cards.

## Tone and copy

Use concise, professional Bahasa Indonesia for the interface:

- “Ringkasan Keuangan”
- “Total Aset”
- “Total Liabilitas”
- “Pendapatan”
- “Laba Bersih”
- “Periode”
- “Impor COA”
- “Lihat Laporan”
- “Belum ada transaksi”

Avoid vague AI-generated copy, excessive greetings, and decorative marketing language inside the dashboard.

## Implementation guardrails

- Build the design as a coherent design system, not disconnected pages.
- Favor reusable components and shared tokens.
- Keep the UI polished but practical for accounting data.
- Do not add authentication, team management, billing, or unrelated SaaS features unless explicitly requested.
- Do not use gradients, glassmorphism, giant hero sections, excessive shadows, or random colorful cards.
- Do not invent accounting calculations in the UI; display values based on the actual data model.
- Ensure the final UI is responsive, accessible, and usable with realistic long account names and large numbers.

## Definition of done

The implementation is visually successful when:

- It immediately feels like a modern premium fintech SaaS dashboard.
- The Behance reference influence is visible through spacing, card treatment, hierarchy, and data visualization style.
- The product still clearly belongs to a COA-based Indonesian financial reporting application.
- Overview, COA, Neraca, Laba Rugi, and Cash Flow feel like one consistent product.
- Financial numbers remain easy to scan and compare.
