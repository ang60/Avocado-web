# ✅ AvoGuard Next.js Migration Checklist

Use this checklist to track your migration progress. Check off items as you complete them.

## 🎯 Phase 1: Initial Setup (5-10 minutes)

- [ ] Backup current `package.json` to `package-vite-backup.json`
- [ ] Replace `package.json` with `package-nextjs.json`
- [ ] Install dependencies (`npm install` or `pnpm install`)
- [ ] Create `postcss.config.js` file
- [ ] Create `app/globals.css` file
- [ ] Update `app/layout.tsx` to import `./globals.css`

## 📝 Phase 2: Add 'use client' to Page Components (10-15 minutes)

Add `'use client';` as the first line in these files:

### Dashboard & Admin
- [ ] `src/app/pages/Dashboard.tsx`
- [ ] `src/app/pages/Admin.tsx`

### Case Management
- [ ] `src/app/pages/CaseManagement.tsx`
- [ ] `src/app/pages/CaseDetail.tsx`

### Monitoring & Reports
- [ ] `src/app/pages/ScoutingReports.tsx`
- [ ] `src/app/pages/OutbreakMonitoring.tsx`
- [ ] `src/app/pages/Alerts.tsx`

### Knowledge Base
- [ ] `src/app/pages/KnowledgeBase.tsx`
- [ ] `src/app/pages/KBArticleDetail.tsx`
- [ ] `src/app/pages/SymptomCodebook.tsx`

### Farmers & Compliance
- [ ] `src/app/pages/Farmers.tsx`
- [ ] `src/app/pages/FarmerDetail.tsx`
- [ ] `src/app/pages/ComplianceHub.tsx`

## 🎭 Phase 3: Add 'use client' to Modal Components (5 minutes)

Add `'use client';` as the first line in these files:

- [ ] `src/app/components/AddUserModal.tsx`
- [ ] `src/app/components/AddRoleModal.tsx`
- [ ] `src/app/components/AddAlertRuleModal.tsx`
- [ ] `src/app/components/TriageCaseModal.tsx`
- [ ] `src/app/components/ScoutingRecordModal.tsx`

### Other Interactive Components (check if they exist)
- [ ] `src/app/components/KenyaHeatMap.tsx` (if it uses state/effects)
- [ ] Any other modal components you find

## 🧭 Phase 4: Add 'use client' to Context Files (2 minutes)

- [ ] `src/app/context/SidebarContext.tsx`

## 🔄 Phase 5: Update Navigation Imports (10-15 minutes)

Find and replace React Router with Next.js navigation:

### Files to Check and Update

#### Replace imports in these files:
- [ ] Search project for `from 'react-router'`
- [ ] Replace `useNavigate` with `useRouter` from `next/navigation`
- [ ] Replace `useLocation` with `usePathname` from `next/navigation`
- [ ] Replace React Router `Link` with Next.js `Link` from `next/link`

#### Specific replacements needed:

**Import statements:**
```diff
- import { useNavigate, Link, useLocation } from 'react-router';
+ import { useRouter, usePathname } from 'next/navigation';
+ import Link from 'next/link';
```

**Hook usage:**
```diff
- const navigate = useNavigate();
- navigate('/path');
+ const router = useRouter();
+ router.push('/path');
```

```diff
- const location = useLocation();
- const pathname = location.pathname;
+ const pathname = usePathname();
```

**Link components:**
```diff
- <Link to="/admin">Admin</Link>
+ <Link href="/admin">Admin</Link>
```

## 🧪 Phase 6: Test All Routes (10 minutes)

Start the dev server and test each route:

### Run Dev Server
- [ ] Run `npm run dev` (or `pnpm dev`)
- [ ] Server starts successfully on http://localhost:3000

### Test Main Routes
- [ ] http://localhost:3000/ (Dashboard)
- [ ] http://localhost:3000/admin
- [ ] http://localhost:3000/scouting-reports
- [ ] http://localhost:3000/case-management
- [ ] http://localhost:3000/outbreak-monitoring
- [ ] http://localhost:3000/alerts
- [ ] http://localhost:3000/knowledge-base
- [ ] http://localhost:3000/symptom-codebook
- [ ] http://localhost:3000/farmers
- [ ] http://localhost:3000/compliance-hub

### Test Dynamic Routes
- [ ] http://localhost:3000/case-management/CSE-1024
- [ ] http://localhost:3000/farmers/FRM-1024
- [ ] http://localhost:3000/knowledge-base/KB-001

## 🎨 Phase 7: Verify Design & Functionality (10 minutes)

### Visual Check
- [ ] Sidebar displays correctly
- [ ] Sidebar collapse/expand works
- [ ] TopBar breadcrumbs work
- [ ] Colors match (Forest Green #1B4332, Cream #F7F4EF)
- [ ] Fonts load correctly (DM Serif Display, IBM Plex Sans)
- [ ] All icons display

### Functionality Check
- [ ] Navigation between pages works
- [ ] Modal open/close works (Admin page)
- [ ] Forms work (Add User, Add Role, Add Alert Rule)
- [ ] Charts render (Dashboard, Compliance Hub)
- [ ] Tables display data
- [ ] Buttons are clickable

### Tab Navigation (Admin Page)
- [ ] Users tab works
- [ ] Roles tab works
- [ ] Alert Rules tab works
- [ ] Settings tab works
- [ ] Add buttons open modals
- [ ] Delete buttons work with confirmation

## 🐛 Phase 8: Debug Issues (if any)

### Common Issues to Check

- [ ] No console errors in browser
- [ ] No TypeScript errors
- [ ] No build warnings
- [ ] All images load
- [ ] All SVG icons display

### If you see errors:

**"useState can only be used in Client Components"**
- [ ] Find the file name in error
- [ ] Add `'use client';` to top of that file

**"Module not found: Can't resolve 'react-router'"**
- [ ] Find remaining React Router imports
- [ ] Replace with Next.js equivalents

**"Hydration failed"**
- [ ] Check for mismatched HTML
- [ ] Ensure `'use client'` on interactive components

**Styles not loading**
- [ ] Verify `app/globals.css` exists
- [ ] Verify it's imported in `app/layout.tsx`
- [ ] Check Tailwind imports

## 🚀 Phase 9: Build & Production Test (Optional)

- [ ] Run `npm run build`
- [ ] Build completes successfully
- [ ] No build errors
- [ ] Run `npm run start`
- [ ] Production build works

## 📊 Migration Progress Tracker

**Total Tasks:** 60+

**Completed:** _____ / 60+

**Estimated Time:** 40-60 minutes

**Actual Time:** _____ minutes

## ✨ Post-Migration Checklist

After everything works:

- [ ] Remove old `src/app/App.tsx` (not needed)
- [ ] Remove old `src/app/routes.ts` (not needed)
- [ ] Remove old Sidebar/TopBar/Layout from `src/app/components/` (use `/components/` versions)
- [ ] Update `.gitignore` to include `.next/`
- [ ] Commit changes to version control
- [ ] Document any custom changes
- [ ] Celebrate! 🎉

## 🎯 Quick Reference

### Add 'use client' Template

```tsx
'use client';

import { useState } from 'react';
// ... rest of imports

export function ComponentName() {
  // ... component code
}
```

### Navigation Update Template

```tsx
// Import
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

// Usage
const router = useRouter();
const pathname = usePathname();

// Navigate programmatically
router.push('/admin');

// Link component
<Link href="/admin">Admin</Link>
```

### File Creation Templates

**`postcss.config.js`:**
```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

**`app/globals.css`:**
```css
@import 'tailwindcss';
@import '../src/styles/fonts.css';
@import '../src/styles/theme.css';
```

## 📝 Notes & Issues Encountered

Use this space to note any issues or customizations:

```
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
```

## 🎓 Resources

- Next.js Docs: https://nextjs.org/docs
- App Router: https://nextjs.org/docs/app
- Migration Guide: https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration
- This project's guides:
  - `README_NEXTJS.md` - Overview
  - `QUICK_START.md` - Getting started
  - `MIGRATION_GUIDE.md` - Detailed guide
  - `FILE_STRUCTURE.md` - File organization

---

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

**Last Updated:** _______________

**Migration Completed By:** _______________
