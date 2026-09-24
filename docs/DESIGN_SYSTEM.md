# CampusFix AI Design System

## Colors

The application uses a consistent set of CSS variables for all colors.

* **Primary**: `#2563EB`
* **Secondary**: `#0F172A`
* **Background**: `#F8FAFC`
* **Surface**: `#FFFFFF`
* **Text**: `#0F172A`
* **Muted**: `#64748B`
* **Border**: `#E2E8F0`
* **Success**: `#16A34A`
* **Warning**: `#F59E0B`
* **Danger**: `#DC2626`
* **Info**: `#2563EB`

## Typography

The primary font used across the application is **Inter**.

Hierarchy:
* **Page Title**: 24px (1.5rem), Semi-Bold
* **Section Title**: 20px (1.25rem), Medium
* **Card Title**: 16px (1rem), Medium
* **Body**: 14px (0.875rem), Regular
* **Caption**: 12px (0.75rem), Regular
* **Muted Text**: Uses the muted text color (`#64748B`)

## Spacing

Uses a consistent spacing scale based on 4px increments:
* `xs`: 4px
* `sm`: 8px
* `md`: 16px
* `lg`: 24px
* `xl`: 32px

## Components

All components are located in `src/components/`.

### Base Components
* `Button`: Primary, secondary, outline, danger, ghost variants. 8px border radius.
* `Card`: Standard container with 12px border radius and surface background.
* `Input` / `Textarea` / `Select`: Form controls with 8px border radius.
* `Badge`: Small label element.
* `Modal`: Dialog window with 12px border radius.
* `Table`: Data display.
* `Tabs`: Navigation tabs.
* `Toast`: Temporary notifications.
* `StatCard`: Used for displaying numerical stats.

### Status Colors
Mapped to the `StatusBadge` component:
* `RECEIVED`: Info
* `ACKNOWLEDGED`: Primary/Info
* `IN_PROGRESS`: Warning
* `RESOLVED`: Success
* `SLA_BREACHED`: Danger

### Priority Colors
Mapped to the `PriorityBadge` component:
* `LOW`: Muted
* `MEDIUM`: Warning
* `HIGH`: Warning
* `CRITICAL`: Danger

## Layout Rules

Use `DashboardLayout` for the main application shell, which provides:
* **Sidebar**: For main navigation.
* **Navbar**: For user profile and top-level actions.
* **PageHeader**: For page title and primary actions.
* **Main Content Area**: For the actual page content.

Responsive Behavior:
* **Desktop**: Sidebar (fixed width) + Content Area
* **Mobile**: Collapsible sidebar, full-width content.

## State Patterns

Standard components provided for:
* **Loading**: Spinners / Skeletons.
* **Empty State**: Used when no data is available.
* **Error State**: Used when a data fetch fails or an error occurs.
