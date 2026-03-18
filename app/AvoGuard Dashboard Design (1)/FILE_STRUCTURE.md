# 📁 AvoGuard Next.js File Structure

## Complete Directory Map

```
avoguard-nextjs/
│
├── 📱 app/                                    [Next.js App Router - NEW]
│   │
│   ├── layout.tsx                            ✅ Root layout with fonts
│   ├── page.tsx                              ✅ Dashboard (home route)
│   ├── providers.tsx                         ✅ Context providers wrapper
│   ├── globals.css                           📝 TO CREATE
│   │
│   ├── 📂 admin/
│   │   └── page.tsx                          ✅ Admin page
│   │
│   ├── 📂 scouting-reports/
│   │   └── page.tsx                          ✅ Scouting reports page
│   │
│   ├── 📂 case-management/
│   │   ├── page.tsx                          ✅ Case list page
│   │   └── 📂 [caseId]/
│   │       └── page.tsx                      ✅ Case detail (dynamic route)
│   │
│   ├── 📂 outbreak-monitoring/
│   │   └── page.tsx                          ✅ Outbreak monitoring page
│   │
│   ├── 📂 alerts/
│   │   └── page.tsx                          ✅ Alerts page
│   │
│   ├── 📂 knowledge-base/
│   │   ├── page.tsx                          ✅ KB list page
│   │   └── 📂 [articleId]/
│   │       └── page.tsx                      ✅ Article detail (dynamic route)
│   │
│   ├── 📂 symptom-codebook/
│   │   └── page.tsx                          ✅ Symptom codebook page
│   │
│   ├── 📂 farmers/
│   │   ├── page.tsx                          ✅ Farmers list page
│   │   └── 📂 [farmerId]/
│   │       └── page.tsx                      ✅ Farmer detail (dynamic route)
│   │
│   └── 📂 compliance-hub/
│       └── page.tsx                          ✅ Compliance/Reports page
│
├── 🧩 components/                             [Shared Next.js Components - NEW]
│   ├── Sidebar.tsx                           ✅ Next.js navigation sidebar
│   ├── TopBar.tsx                            ✅ Breadcrumb navigation
│   └── Layout.tsx                            ✅ Layout wrapper component
│
├── 📦 src/                                    [Existing Code - KEEP & UPDATE]
│   │
│   ├── 📂 app/
│   │   │
│   │   ├── 📂 components/                    [Need 'use client' directive]
│   │   │   ├── AddUserModal.tsx              📝 Add 'use client'
│   │   │   ├── AddRoleModal.tsx              📝 Add 'use client'
│   │   │   ├── AddAlertRuleModal.tsx         📝 Add 'use client'
│   │   │   ├── TriageCaseModal.tsx           📝 Add 'use client'
│   │   │   ├── ScoutingRecordModal.tsx       📝 Add 'use client'
│   │   │   ├── KenyaHeatMap.tsx              📝 Add 'use client'
│   │   │   ├── Sidebar.tsx                   ⚠️ Use /components/Sidebar.tsx instead
│   │   │   ├── TopBar.tsx                    ⚠️ Use /components/TopBar.tsx instead
│   │   │   ├── Layout.tsx                    ⚠️ Use /components/Layout.tsx instead
│   │   │   └── ... (other components)
│   │   │
│   │   ├── 📂 pages/                         [Need 'use client' directive]
│   │   │   ├── Dashboard.tsx                 📝 Add 'use client'
│   │   │   ├── Admin.tsx                     📝 Add 'use client'
│   │   │   ├── ScoutingReports.tsx           📝 Add 'use client'
│   │   │   ├── CaseManagement.tsx            📝 Add 'use client'
│   │   │   ├── CaseDetail.tsx                📝 Add 'use client'
│   │   │   ├── OutbreakMonitoring.tsx        📝 Add 'use client'
│   │   │   ├── Alerts.tsx                    📝 Add 'use client'
│   │   │   ├── KnowledgeBase.tsx             📝 Add 'use client'
│   │   │   ├── KBArticleDetail.tsx           📝 Add 'use client'
│   │   │   ├── SymptomCodebook.tsx           📝 Add 'use client'
│   │   │   ├── Farmers.tsx                   📝 Add 'use client'
│   │   │   ├── FarmerDetail.tsx              📝 Add 'use client'
│   │   │   └── ComplianceHub.tsx             📝 Add 'use client'
│   │   │
│   │   ├── 📂 context/                       [Need 'use client' directive]
│   │   │   └── SidebarContext.tsx            📝 Add 'use client'
│   │   │
│   │   ├── 📂 data/
│   │   │   └── ... (data files)              ✅ No changes needed
│   │   │
│   │   ├── App.tsx                           ⚠️ Not needed in Next.js
│   │   └── routes.ts                         ⚠️ Not needed in Next.js
│   │
│   ├── 📂 styles/
│   │   ├── fonts.css                         ✅ Keep as is
│   │   └── theme.css                         ✅ Keep as is
│   │
│   └── 📂 imports/
│       ├── avocado_logo.svg                  ✅ Keep as is
│       └── ... (other assets)
│
├── 📂 public/                                 [Static Assets - Optional]
│   └── ... (move static files here)
│
├── ⚙️ Configuration Files
│   ├── next.config.js                        ✅ Created
│   ├── tsconfig.json                         ✅ Created
│   ├── postcss.config.js                     📝 TO CREATE
│   ├── package.json                          📝 Switch from package-nextjs.json
│   └── package-nextjs.json                   ✅ Next.js dependencies ready
│
└── 📚 Documentation
    ├── README_NEXTJS.md                      ✅ Overview
    ├── QUICK_START.md                        ✅ Quick start guide
    ├── MIGRATION_GUIDE.md                    ✅ Detailed migration
    ├── FILE_STRUCTURE.md                     ✅ This file
    └── find-client-components.sh             ✅ Helper script
```

## 🔑 Legend

- ✅ **Already created/ready** - No action needed
- 📝 **Needs update** - Action required
- ⚠️ **Deprecated** - Will be replaced or not used in Next.js

## 📊 File Count Summary

| Category | Count | Status |
|----------|-------|--------|
| Next.js routes created | 13 | ✅ Complete |
| Next.js components created | 3 | ✅ Complete |
| Configuration files | 3 | ✅ Complete |
| Page components needing 'use client' | 13 | 📝 To do |
| Modal components needing 'use client' | 5+ | 📝 To do |
| Context files needing 'use client' | 1 | 📝 To do |
| Files needing navigation updates | ~5-10 | 📝 To do |

## 🎯 File-by-File Action Items

### ✅ No Action Needed (Already Done)

```
app/layout.tsx
app/page.tsx
app/providers.tsx
app/*/page.tsx (all 13 routes)
components/Sidebar.tsx
components/TopBar.tsx
components/Layout.tsx
next.config.js
tsconfig.json
package-nextjs.json
```

### 📝 Add 'use client' Directive

**Page Components** (13 files):
```
src/app/pages/Dashboard.tsx
src/app/pages/Admin.tsx
src/app/pages/ScoutingReports.tsx
src/app/pages/CaseManagement.tsx
src/app/pages/CaseDetail.tsx
src/app/pages/OutbreakMonitoring.tsx
src/app/pages/Alerts.tsx
src/app/pages/KnowledgeBase.tsx
src/app/pages/KBArticleDetail.tsx
src/app/pages/SymptomCodebook.tsx
src/app/pages/Farmers.tsx
src/app/pages/FarmerDetail.tsx
src/app/pages/ComplianceHub.tsx
```

**Modal Components** (~5 files):
```
src/app/components/AddUserModal.tsx
src/app/components/AddRoleModal.tsx
src/app/components/AddAlertRuleModal.tsx
src/app/components/TriageCaseModal.tsx
src/app/components/ScoutingRecordModal.tsx
```

**Context Files** (1 file):
```
src/app/context/SidebarContext.tsx
```

### 🔄 Update Navigation Imports

Files using React Router need updates:
```
src/app/components/... (any using Link or useNavigate)
src/app/pages/... (any using Link or useNavigate)
```

### 📁 Create New Files

```
app/globals.css                  - Global styles import
postcss.config.js                - PostCSS config for Tailwind
```

## 🚀 Migration Priority Order

### Phase 1: Setup (5 minutes)
1. Switch to package-nextjs.json
2. Install dependencies
3. Create postcss.config.js
4. Create app/globals.css

### Phase 2: Add 'use client' (15 minutes)
1. All page components (13 files)
2. All modal components (5 files)
3. Context file (1 file)

### Phase 3: Update Navigation (10 minutes)
1. Find files using React Router
2. Replace with Next.js navigation
3. Update Link components

### Phase 4: Test (10 minutes)
1. Run dev server
2. Test all 13 routes
3. Fix any errors

**Total estimated time: 40 minutes**

## 💡 Pro Tips

### Quick 'use client' Addition

Use find/replace in your IDE:

**Find:** `^(import.*)`
**Replace:** `'use client';\n\n$1`

Then manually verify each file.

### Batch Import Updates

**Find:** `import { useNavigate, Link } from 'react-router';`
**Replace:** `import { useRouter } from 'next/navigation';\nimport Link from 'next/link';`

**Find:** `const navigate = useNavigate();`
**Replace:** `const router = useRouter();`

**Find:** `navigate\(([^)]+)\)`
**Replace:** `router.push($1)`

## 📍 Current vs Next.js Routing

| Current (React Router) | Next.js Equivalent | File Location |
|----------------------|-------------------|---------------|
| `/` | `/` | `app/page.tsx` |
| `/admin` | `/admin` | `app/admin/page.tsx` |
| `/case-management/:caseId` | `/case-management/[caseId]` | `app/case-management/[caseId]/page.tsx` |
| `/farmers/:farmerId` | `/farmers/[farmerId]` | `app/farmers/[farmerId]/page.tsx` |
| `/knowledge-base/:articleId` | `/knowledge-base/[articleId]` | `app/knowledge-base/[articleId]/page.tsx` |

## 🎨 Styling Structure

```
Tailwind CSS v4
├── app/globals.css              - Imports everything
│   ├── @import 'tailwindcss'
│   ├── @import '../src/styles/fonts.css'
│   └── @import '../src/styles/theme.css'
│
├── src/styles/fonts.css         - Font face declarations
└── src/styles/theme.css         - Theme CSS variables
```

## 🔍 Finding What Needs Updates

Run the helper script:

```bash
chmod +x find-client-components.sh
./find-client-components.sh
```

This will show you all files that need 'use client' directive.

---

**Ready to migrate?** Start with `QUICK_START.md`! 🚀
