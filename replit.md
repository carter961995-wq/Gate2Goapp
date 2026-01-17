# Gate2Go - React Native/Expo App

## Overview
Gate2Go is a gate design and pricing application for contractors. Ported from Swift/SwiftUI to React Native/Expo.

## Features
- **Onboarding**: 3-page introduction with feature highlights
- **Subscription System**: Essential and Premium tiers (MVP uses local toggle)
- **Projects Management**: Create, view, and manage gate design projects
- **Gate Design**: Select gate styles, materials, and dimensions
- **Visual Gate Designer**: SVG canvas preview with live customization
- **Add-ons System**: 6 hardware add-ons (keypad, latch, opener, hinges, wheels, lock)
- **Pricing Calculator**: Base price calculation with markup, labor, and tax
- **Design Versions**: Save and view multiple design versions per project
- **Photo Integration**: Import jobsite photos using device camera/gallery
- **PDF Proposals**: Generate and share professional PDF proposals
- **Company Branding**: Custom logo, company name, phone, and email on proposals

## App Structure

### Navigation
- `App.tsx` → Controls onboarding/paywall/main app flow
- `RootStackNavigator` → Main stack with Projects, New Project, Workspace, Gallery, Detail screens
- `MainTabNavigator` → Bottom tabs for Projects and Settings
- `ProjectsStackNavigator` / `SettingsStackNavigator` → Tab-specific stacks

### Key Screens
- `OnboardingScreen` - Introduction slides
- `PaywallScreen` - Subscription selection
- `ProjectsListScreen` - List of all projects with search
- `NewProjectScreen` - Create new project with photo and client info
- `ProjectWorkspaceScreen` - Design gate with style/material/size selection and pricing
- `DesignGalleryScreen` - View saved design versions
- `DesignDetailScreen` - Individual design details
- `SettingsScreen` - App settings, defaults, and branding

### Core Components
- `VisualCard` - Selectable cards for gate styles and materials
- `GateDesigner` - SVG canvas rendering gate preview with customization
- `GateStyleCard` - Gate style selection cards with images
- `AddOnPicker` - Hardware add-on selection component
- `PhotoPicker` - Image picker for jobsite photos
- `ProjectCard` - Project list item card
- `EmptyState` - Empty list state display
- `InputField` - Form input with label

### State Management
- `AppContext` - Global state via React Context
- `storage.ts` - AsyncStorage persistence layer
- `pricing.ts` - Pricing calculation utilities

### Data Models (client/types/gate2go.ts)
- `Project` - Jobsite project with photo and client info
- `GateDesign` - Saved gate design with specifications and pricing
- `GateStyle` - Gate type (single swing, double swing, cantilever, etc.)
- `Material` - Gate material (wood, steel, chain link, aluminum)
- `AddonLineItem` - Add-ons like keypad, latch, opener

## Gate Styles (with AI-generated images)
| Style | Tier | Image |
|-------|------|-------|
| Single Swing | Essential | Rustic wooden swing gate |
| Double Swing | Essential | Ornate wrought iron gates |
| Roll Gate | Essential | Industrial steel roll gate |
| Cantilever Slide | Premium | Modern cantilever sliding gate |
| Overhead Track | Premium | Modern aluminum slat gate |
| Vertical Pivot | Premium | Vertical pivot security gate |

Gate images are located in `assets/images/gates/` and displayed via the `GateStyleCard` component.

## Materials
| Material | Tier |
|----------|------|
| Wood | Essential |
| Steel | Essential |
| Chain Link | Premium |
| Aluminum | Premium |

## Running the App
- **Frontend**: `npm run expo:dev` (port 8081)
- **Backend**: `npm run server:dev` (port 5000) - Required for API if using backend features

## Tech Stack
- React Native / Expo
- React Navigation 7+
- AsyncStorage for local persistence
- Expo Image Picker for photos
- Reanimated for animations
- Expo Haptics for feedback

## Original Source
Ported from Swift/SwiftUI Gate2Go iOS app (xcode_projects/gate2go-repo/)
