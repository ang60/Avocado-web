# AvoGuard Migration to Next.js - Complete Guide

## ✅ What's Already Done

I've created the Next.js structure for you with:

1. **Next.js App Router Setup**
   - `/app/layout.tsx` - Root layout with font optimization
   - `/app/providers.tsx` - Client-side context providers
   - All page routes created in `/app/*` directory

2. **Converted Components**
   - `/components/Sidebar.tsx` - Using Next.js `Link` and `usePathname`
   - `/components/TopBar.tsx` - Using Next.js navigation hooks
   - `/components/Layout.tsx` - Client component wrapper

3. **All Routes Migrated**
   - ✅ Dashboard (`/`)
   - ✅ Admin (`/admin`)
   - ✅ Scouting Reports (`/scouting-reports`)
   - ✅ Case Management (`/case-management`)
   - ✅ Case Details (`/case-management/[caseId]`)
   - ✅ Outbreak Monitoring (`/outbreak-monitoring`)
   - ✅ Alerts (`/alerts`)
   - ✅ Knowledge Base (`/knowledge-base`)
   - ✅ KB Article (`/knowledge-base/[articleId]`)
   - ✅ Symptom Codebook (`/symptom-codebook`)
   - ✅ Farmers (`/farmers`)
   - ✅ Farmer Details (`/farmers/[farmerId]`)
   - ✅ Compliance Hub (`/compliance-hub`)

## 🚀 Next Steps to Complete Migration

### Step 1: Install Next.js Dependencies

```bash
# Remove old package.json and install Next.js
rm package.json
mv package-nextjs.json package.json

# Install dependencies (use npm, yarn, or pnpm)
npm install
# or
pnpm install
# or
yarn install
```

### Step 2: Update Remaining Page Components

You need to add `'use client'` directive to these page files that use state/hooks:

**Files to update:**

1. `/src/app/pages/Dashboard.tsx` - Add `'use client';` at top
2. `/src/app/pages/Admin.tsx` - Add `'use client';` at top
3. `/src/app/pages/CaseManagement.tsx` - Add `'use client';` at top
4. `/src/app/pages/CaseDetail.tsx` - Add `'use client';` at top
5. `/src/app/pages/Alerts.tsx` - Add `'use client';` at top
6. `/src/app/pages/KnowledgeBase.tsx` - Add `'use client';` at top
7. All other pages with `useState`, `useEffect`, or event handlers

**Example:**
```tsx
'use client';

import { Layout } from '../components/Layout';
import { useState } from 'react';

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  // ... rest of component
}
```

### Step 3: Update All Modal Components

Add `'use client'` to all modal components:

**Files:**
- `/src/app/components/AddUserModal.tsx`
- `/src/app/components/AddRoleModal.tsx`
- `/src/app/components/AddAlertRuleModal.tsx`
- `/src/app/components/TriageCaseModal.tsx`
- `/src/app/components/ScoutingRecordModal.tsx`
- All other modal/interactive components

### Step 4: Update Navigation in Components

Replace React Router navigation with Next.js:

**Find and replace:**

```tsx
// OLD (React Router)
import { useNavigate, Link } from 'react-router';
const navigate = useNavigate();
navigate('/case-management/CSE-1024');

// NEW (Next.js)
import { useRouter } from 'next/navigation';
import Link from 'next/link';
const router = useRouter();
router.push('/case-management/CSE-1024');
```

**Files to check:**
- Any component using `useNavigate()` or `<Link>`
- Check `/src/app/components/` directory

### Step 5: Update Layout Components

Update Layout component usage:

**Old:**
```tsx
import { Layout } from '../components/Layout';
```

**New (use Next.js shared components):**
```tsx
import { Layout } from '@/components/Layout';
// or
import { Layout } from '../../../components/Layout';
```

### Step 6: Create Tailwind CSS Configuration

Create `/postcss.config.js`:

```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

Create `/app/globals.css`:

```css
@import 'tailwindcss';
@import '../src/styles/fonts.css';
@import '../src/styles/theme.css';
```

Update `/app/layout.tsx` to import globals:

```tsx
import './globals.css';
```

### Step 7: Update Context Providers

Add `'use client'` to context files:

```tsx
// /src/app/context/SidebarContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
// ... rest of file
```

### Step 8: Run Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Visit `http://localhost:3000`

### Step 9: Fix Any Import Path Issues

Update imports to use TypeScript path aliases:

```tsx
// Instead of:
import { Layout } from '../../../src/app/components/Layout';

// Use:
import { Layout } from '@/components/Layout';
```

### Step 10: Test All Routes

Visit each route to ensure it works:
- [ ] http://localhost:3000/
- [ ] http://localhost:3000/admin
- [ ] http://localhost:3000/case-management
- [ ] http://localhost:3000/case-management/CSE-1024
- [ ] http://localhost:3000/farmers
- [ ] http://localhost:3000/knowledge-base
- [ ] http://localhost:3000/alerts
- [ ] etc.

## 📁 Final Directory Structure

```
avoguard-nextjs/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Dashboard (home)
│   ├── providers.tsx                 # Context providers
│   ├── globals.css                   # Global styles
│   ├── admin/
│   │   └── page.tsx
│   ├── scouting-reports/
│   │   └── page.tsx
│   ├── case-management/
│   │   ├── page.tsx
│   │   └── [caseId]/
│   │       └── page.tsx
│   └── ... (all other routes)
├── components/                        # Shared Next.js components
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   └── Layout.tsx
├── src/                              # Keep existing code for now
│   ├── app/
│   │   ├── components/               # Add 'use client' to these
│   │   ├── pages/                    # Add 'use client' to these
│   │   ├── context/                  # Add 'use client' to these
│   │   └── data/
│   ├── styles/
│   └── imports/
├── public/                           # Static assets
├── next.config.js
├── tsconfig.json
├── postcss.config.js
└── package.json
```

## 🔧 Common Issues & Solutions

### Issue: "Module not found" errors

**Solution:** Check import paths and use `@/` alias defined in `tsconfig.json`

### Issue: "You're importing a component that needs useState"

**Solution:** Add `'use client';` directive to the top of that component file

### Issue: Fonts not loading

**Solution:** Ensure `next/font/google` is properly configured in `app/layout.tsx`

### Issue: Styles not applying

**Solution:** Check that CSS imports are in the correct order in `globals.css`

### Issue: Navigation not working

**Solution:** Ensure you're using Next.js `Link` and `useRouter` from `next/navigation`

## 🎯 Quick Commands Reference

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type check
tsc --noEmit

# Lint
npm run lint
```

## 🌟 Next.js Benefits You'll Gain

✅ **Automatic Code Splitting** - Faster page loads
✅ **Image Optimization** - Built-in `<Image>` component
✅ **Font Optimization** - Automatic font loading
✅ **Server Components** - Better performance by default
✅ **API Routes** - Built-in backend endpoints (`/app/api/*`)
✅ **SEO** - Server-side rendering support
✅ **Edge Functions** - Deploy to edge for ultra-low latency
✅ **Built-in TypeScript** - Better DX

## 📞 Need Help?

If you encounter issues during migration:

1. Check the Next.js documentation: https://nextjs.org/docs
2. Review the App Router guide: https://nextjs.org/docs/app
3. Check TypeScript configuration: https://nextjs.org/docs/app/building-your-application/configuring/typescript

---

**Migration Status:** Initial structure complete ✅  
**Next Task:** Add `'use client'` directives and test all routes
