# View Switcher UI Improvements

## Overview

Improved view switching UI using shadcn components with a **hybrid responsive approach** that adapts to screen size and number of views.

## Strategy

### **Approach by View Count:**

1. **5-6 views (Story Types, Scenes)**
   - **Mobile**: Dropdown Select (compact, easy to use)
   - **Desktop**: Tabs (visual, immediate access)

2. **10+ views (Stories, Shots)**
   - **All screens**: Grouped Dropdown Select
   - Organized into logical groups for better navigation

## Component Files

### Created Improved Components:

1. `story-types/components/view-selector-improved.tsx` - Hybrid tabs/select (5 views)
2. `scenes/components/view-selector-improved.tsx` - Hybrid tabs/select (6 views)
3. `stories/components/view-selector-improved.tsx` - Grouped select (10 views)
4. `shots/components/view-selector-improved.tsx` - Grouped select (12 views)

## Key Improvements

### 1. **Responsive Design**
- Mobile: Always uses dropdown select (works better on small screens)
- Desktop: Context-appropriate UI (tabs for few views, select for many)

### 2. **Logical Grouping** (Stories & Shots)
Stories groups:
- Management: Active Story, Manage Media, Manage Story, Archived
- Workflow: Generate Story, Add Scenes/Shots, Combine Scenes, Build Final Story, Final Cut, Add Captions

Shots groups:
- Overview: All Shots
- Assets: Images, Audio, Video, Upload
- Generation: Generate Image/Audio/Video, Build Final Shot
- Automation: Run Generate Image/Audio/Video

### 3. **Better Mobile UX**
- Full-width dropdowns on mobile
- Searchable/scrollable for many options
- No horizontal overflow issues

### 4. **Visual Hierarchy**
- Emojis for quick visual identification
- Group labels for context
- Consistent spacing and sizing

### 5. **Accessibility**
- Keyboard navigation
- Clear labels
- ARIA attributes from Radix UI primitives

## Implementation

To use the improved selectors, update the client components:

### Story Types Example:
```tsx
// Replace import
import { ViewSelector } from "./view-selector";
// With:
import { ViewSelectorImproved as ViewSelector } from "./view-selector-improved";
```

### Benefits:
- ✅ Better mobile experience
- ✅ Cleaner desktop UI
- ✅ Logical grouping for complex views
- ✅ No horizontal scroll issues
- ✅ Searchable dropdowns
- ✅ Consistent UX patterns

## Comparison

### Before (Current Tabs):
- ❌ Horizontal overflow on mobile
- ❌ Cramped on smaller screens
- ❌ Hard to scan 12+ options
- ❌ No logical grouping

### After (Hybrid Approach):
- ✅ Responsive design
- ✅ Grouped organization
- ✅ Searchable on mobile
- ✅ Clean desktop UI
- ✅ Better accessibility
