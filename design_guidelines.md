# Gate2Go Design Guidelines

## Brand Identity

**Purpose**: Gate2Go empowers contractors to design custom gates and generate accurate pricing on-site, eliminating guesswork and streamlining the sales process.

**Aesthetic Direction**: Refined Professional — Think blueprint precision meets modern iOS elegance. Clean, uncluttered interfaces with generous whitespace, subtle shadows on cards that suggest physical materials, and a blue accent that conveys trust and expertise. This is a tool contractors rely on for their livelihood, so every interaction feels confident and precise.

**Memorable Element**: The dimensional stepper controls are oversized and tactile, making adjustments feel physical and precise. Material cards show realistic textures (wood grain, metal finishes) that contractors can show clients directly from the app.

## Navigation Architecture

**Root Navigation**: Tab Bar (3 tabs)

**Tabs**:
1. **Design** - Core gate builder with material/style selection and pricing
2. **Projects** - Saved gate designs and quote history
3. **Settings** - User profile, preferences, material catalog management

## Screen-by-Screen Specifications

### 1. Design Screen (Tab 1)
**Purpose**: Build a custom gate design and see live pricing.

**Layout**:
- Header: Transparent, title "New Gate Design", right button: "Save" (blue text)
- Main content: ScrollView with vertical card stack
- Safe area insets: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- **Gate Style Card**: Grid of 6 style options (Single Swing, Double Swing, Sliding, Cantilever, Vertical Slat, Horizontal Board) with visual previews and radio selection
- **Dimensions Card**: Two horizontal stepper controls (Width in feet, Height in feet) with large ±/buttons flanking centered value display
- **Material Card**: Scrollable horizontal list of material swatches (Cedar, Redwood, Aluminum, Steel, Vinyl, Composite) showing texture and name
- **Hardware Card**: Dropdown selector for hinge/latch options
- **Pricing Summary**: Sticky card at bottom showing itemized costs (Materials, Hardware, Labor) with total in large bold text

**Empty State**: None (screen always shows default configuration)

### 2. Projects Screen (Tab 2)
**Purpose**: Browse saved gate designs and historical quotes.

**Layout**:
- Header: Default navigation header, title "Projects", right button: "+" (system plus icon)
- Main content: List of project cards
- Safe area insets: top = Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- **Project Cards**: Each card shows gate thumbnail illustration, project name, date, customer name (if entered), and total price. Tap to view/edit.
- **Search Bar**: Below header, filters by project name or customer

**Empty State**: Illustration (empty-projects.png) with text "No projects yet" and subtitle "Tap + to design your first gate"

### 3. Settings Screen (Tab 3)
**Purpose**: Manage user profile, app preferences, and material pricing.

**Layout**:
- Header: Default navigation header, title "Settings"
- Main content: Grouped list/form
- Safe area insets: top = Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- **Profile Section**: Avatar image, display name field, company name field
- **Preferences Section**: Toggle for metric/imperial units, toggle for tax inclusion, labor rate input ($/hour)
- **Materials Section**: "Manage Material Pricing" navigation link (opens new screen with editable price list)
- **About Section**: App version, privacy policy link, terms of service link

### 4. Project Detail Screen (Modal from Projects)
**Purpose**: View or edit a saved project.

**Layout**:
- Header: Modal navigation header, title "Project Name", left button: "Close", right button: "Share" (system share icon)
- Main content: Same as Design screen but pre-populated
- Safe area insets: top = Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components**: Identical to Design screen, plus "Delete Project" button at bottom in destructive red color

## Color Palette

- **Primary**: #2563EB (Professional Blue, used for active states, CTAs, selected items)
- **Primary Dark**: #1E40AF (Blue hover/pressed states)
- **Background**: #F8FAFC (Soft cool gray, recedes behind white cards)
- **Surface**: #FFFFFF (Card backgrounds)
- **Border**: #E2E8F0 (Card borders, dividers)
- **Text Primary**: #0F172A (Dark slate, high contrast for readability)
- **Text Secondary**: #64748B (Medium slate, supporting text)
- **Success**: #10B981 (Green for pricing indicators)
- **Destructive**: #EF4444 (Red for delete actions)

## Typography

**Font**: SF Pro (iOS system font)

**Type Scale**:
- **Large Title**: 34pt, Bold (screen titles)
- **Title**: 20pt, Semibold (card headers)
- **Body**: 16pt, Regular (main content, inputs)
- **Subhead**: 14pt, Medium (labels, secondary info)
- **Caption**: 12pt, Regular (metadata, hints)
- **Price Display**: 28pt, Bold (total pricing)

## Visual Design

- **Cards**: White background, 1pt border (#E2E8F0), 12pt corner radius, NO shadow
- **Stepper Buttons**: 56x56pt touch targets, circular, border matching Primary color, ± icons in Primary color
- **Material Swatches**: 80x80pt squares with realistic texture images, 8pt corner radius, blue 2pt border when selected
- **Floating Save Button** (if needed): Use shadow specification from system prompt

## Assets to Generate

1. **icon.png** - App icon showing stylized gate silhouette in blue gradient
2. **splash-icon.png** - Same gate icon on solid background for launch screen
3. **empty-projects.png** - Illustration of empty folder with blueprints, soft blue/gray tones - USED: Projects screen empty state
4. **avatar-contractor.png** - Generic contractor avatar (hard hat icon or person silhouette) - USED: Settings profile section default avatar
5. **gate-single-swing.png** - Line drawing of single swing gate - USED: Design screen style selector
6. **gate-double-swing.png** - Line drawing of double swing gate - USED: Design screen style selector
7. **gate-sliding.png** - Line drawing of sliding gate - USED: Design screen style selector
8. **gate-cantilever.png** - Line drawing of cantilever gate - USED: Design screen style selector
9. **gate-vertical-slat.png** - Line drawing of vertical slat design - USED: Design screen style selector
10. **gate-horizontal-board.png** - Line drawing of horizontal board design - USED: Design screen style selector
11. **texture-cedar.jpg** - Wood grain texture - USED: Material selector swatch
12. **texture-aluminum.jpg** - Brushed metal texture - USED: Material selector swatch