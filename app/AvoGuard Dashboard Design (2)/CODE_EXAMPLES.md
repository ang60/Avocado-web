# 💻 Code Examples - React to Next.js Migration

Quick reference for common migration patterns.

---

## 🎯 Adding 'use client' Directive

### Before (React Router)
```tsx
import { Layout } from '../components/Layout';
import { useState } from 'react';

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  // ...
}
```

### After (Next.js)
```tsx
'use client';

import { Layout } from '../components/Layout';
import { useState } from 'react';

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  // ...
}
```

**Key Change:** Add `'use client';` as the FIRST line

---

## 🧭 Navigation Updates

### Programmatic Navigation

#### Before (React Router)
```tsx
import { useNavigate } from 'react-router';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/admin');
    navigate(`/case-management/${caseId}`);
  };
  
  return <button onClick={handleClick}>Go to Admin</button>;
}
```

#### After (Next.js)
```tsx
'use client';

import { useRouter } from 'next/navigation';

function MyComponent() {
  const router = useRouter();
  
  const handleClick = () => {
    router.push('/admin');
    router.push(`/case-management/${caseId}`);
  };
  
  return <button onClick={handleClick}>Go to Admin</button>;
}
```

**Key Changes:**
- `useNavigate` → `useRouter` from `next/navigation`
- `navigate(path)` → `router.push(path)`

---

### Link Components

#### Before (React Router)
```tsx
import { Link } from 'react-router';

function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/admin">Admin</Link>
      <Link to={`/case-management/${id}`}>View Case</Link>
    </nav>
  );
}
```

#### After (Next.js)
```tsx
import Link from 'next/link';

function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/admin">Admin</Link>
      <Link href={`/case-management/${id}`}>View Case</Link>
    </nav>
  );
}
```

**Key Changes:**
- `from 'react-router'` → `from 'next/link'`
- `to=` prop → `href=` prop

---

### Getting Current Path

#### Before (React Router)
```tsx
import { useLocation } from 'react-router';

function MyComponent() {
  const location = useLocation();
  const pathname = location.pathname;
  const isActive = pathname === '/admin';
  
  return <div>Current path: {pathname}</div>;
}
```

#### After (Next.js)
```tsx
'use client';

import { usePathname } from 'next/navigation';

function MyComponent() {
  const pathname = usePathname();
  const isActive = pathname === '/admin';
  
  return <div>Current path: {pathname}</div>;
}
```

**Key Changes:**
- `useLocation` → `usePathname` from `next/navigation`
- Direct string instead of object

---

## 📄 Page Component Pattern

### Dynamic Route Page

#### Current Structure
```tsx
// src/app/routes.ts
{
  path: "/case-management/:caseId",
  Component: CaseDetail,
}

// src/app/pages/CaseDetail.tsx
export function CaseDetail() {
  const { caseId } = useParams();
  // ...
}
```

#### Next.js Structure
```tsx
// app/case-management/[caseId]/page.tsx
import { CaseDetail } from '../../../src/app/pages/CaseDetail';

export default function CaseDetailPage({ 
  params 
}: { 
  params: { caseId: string } 
}) {
  return <CaseDetail />;
}
```

**If you need the caseId in CaseDetail.tsx:**

```tsx
// src/app/pages/CaseDetail.tsx
'use client';

import { usePathname } from 'next/navigation';

export function CaseDetail() {
  const pathname = usePathname();
  const caseId = pathname.split('/').pop(); // Get last segment
  
  // Or pass as prop from page.tsx:
  // export function CaseDetail({ caseId }: { caseId: string }) {
  
  return <div>Case: {caseId}</div>;
}
```

---

## 🎨 Layout Component

### Before (React Router)
```tsx
// src/app/components/Layout.tsx
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <TopBar />
        <main>{children}</main>
      </div>
    </div>
  );
}
```

### After (Next.js)
```tsx
// components/Layout.tsx
'use client';

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useSidebar } from '../src/app/context/SidebarContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div 
        className="flex-1 flex flex-col transition-all duration-300" 
        style={{ marginLeft: isCollapsed ? '0px' : '240px' }}
      >
        <TopBar />
        <main style={{ backgroundColor: '#F7F4EF', padding: '32px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
```

**Key Changes:**
- Add `'use client';` directive
- Use existing context hook
- Same structure, different location

---

## 🎯 Context Provider

### Before (React Router)
```tsx
// src/app/context/SidebarContext.tsx
import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within SidebarProvider');
  return context;
}
```

### After (Next.js)
```tsx
// src/app/context/SidebarContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within SidebarProvider');
  return context;
}
```

**Key Change:** Add `'use client';` at the top

---

## 🎭 Modal Component

### Before (React)
```tsx
// src/app/components/AddUserModal.tsx
import { X } from 'lucide-react';
import { useState } from 'react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: any) => void;
}

export function AddUserModal({ isOpen, onClose, onSave }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  
  if (!isOpen) return null;
  
  return (
    <div className="modal">
      {/* Modal content */}
    </div>
  );
}
```

### After (Next.js)
```tsx
// src/app/components/AddUserModal.tsx
'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: any) => void;
}

export function AddUserModal({ isOpen, onClose, onSave }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  
  if (!isOpen) return null;
  
  return (
    <div className="modal">
      {/* Modal content */}
    </div>
  );
}
```

**Key Change:** Add `'use client';` at the top

---

## 📦 Import Path Updates

### Before (Relative Imports)
```tsx
import { Layout } from '../components/Layout';
import { Dashboard } from '../pages/Dashboard';
import { useSidebar } from '../context/SidebarContext';
```

### After (With Path Aliases) - Optional
```tsx
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { useSidebar } from '@/context/SidebarContext';
```

**Path aliases defined in `tsconfig.json`:**
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/components/*": ["./src/app/components/*"],
    "@/pages/*": ["./src/app/pages/*"],
    "@/context/*": ["./src/app/context/*"]
  }
}
```

---

## 🖼️ Image Handling

### Before (Vite)
```tsx
import logo from '../../imports/avocado_logo.svg';

function Header() {
  return <img src={logo} alt="Logo" />;
}
```

### After (Next.js - Same for SVGs)
```tsx
import logo from '../../imports/avocado_logo.svg';

function Header() {
  return <img src={logo} alt="Logo" />;
}
```

**For raster images, optionally use Next.js Image:**
```tsx
import Image from 'next/image';
import logo from '../../imports/avocado_logo.png';

function Header() {
  return (
    <Image 
      src={logo} 
      alt="Logo" 
      width={32} 
      height={32}
      priority // For above-fold images
    />
  );
}
```

---

## 🎨 Styling

### Global CSS

#### Create `app/globals.css`:
```css
@import 'tailwindcss';
@import '../src/styles/fonts.css';
@import '../src/styles/theme.css';
```

#### Import in `app/layout.tsx`:
```tsx
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Component Styling (No Change)
```tsx
<div 
  className="p-6 rounded-lg border"
  style={{ 
    backgroundColor: '#FFFFFF', 
    borderColor: '#E0DDD6' 
  }}
>
  Content
</div>
```

---

## 🔧 Configuration Files

### `next.config.js`
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [], // Add external image domains if needed
  },
};

module.exports = nextConfig;
```

### `postcss.config.js`
```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### `tsconfig.json` (key sections)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 🚀 Scripts & Commands

### `package.json` Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Running the App
```bash
# Development
npm run dev
# or
pnpm dev

# Production build
npm run build
npm run start
```

---

## 📊 Complete File Example

### Complete Page Component (Before)
```tsx
// src/app/pages/Admin.tsx
import { Layout } from '../components/Layout';
import { Users, Settings } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AddUserModal } from '../components/AddUserModal';

export function Admin() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleViewUser = (id: string) => {
    navigate(`/admin/users/${id}`);
  };
  
  return (
    <Layout>
      <h1>Admin</h1>
      <button onClick={() => setIsModalOpen(true)}>Add User</button>
      <AddUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      />
    </Layout>
  );
}
```

### Complete Page Component (After)
```tsx
// src/app/pages/Admin.tsx
'use client';

import { Layout } from '../components/Layout';
import { Users, Settings } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AddUserModal } from '../components/AddUserModal';

export function Admin() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  
  const handleViewUser = (id: string) => {
    router.push(`/admin/users/${id}`);
  };
  
  return (
    <Layout>
      <h1>Admin</h1>
      <button onClick={() => setIsModalOpen(true)}>Add User</button>
      <AddUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      />
    </Layout>
  );
}
```

**Changes made:**
1. Added `'use client';` at top
2. Changed `useNavigate` to `useRouter`
3. Changed `navigate` to `router.push`
4. Import from `next/navigation`

---

## 🎯 Quick Migration Checklist

For each component file:

1. [ ] Add `'use client';` at the top (if it uses hooks/state)
2. [ ] Replace `import { useNavigate } from 'react-router'` with `import { useRouter } from 'next/navigation'`
3. [ ] Replace `const navigate = useNavigate()` with `const router = useRouter()`
4. [ ] Replace `navigate('/path')` with `router.push('/path')`
5. [ ] Replace `import { Link } from 'react-router'` with `import Link from 'next/link'`
6. [ ] Replace `<Link to="/path">` with `<Link href="/path">`
7. [ ] Replace `import { useLocation } from 'react-router'` with `import { usePathname } from 'next/navigation'`
8. [ ] Replace `const location = useLocation()` with `const pathname = usePathname()`
9. [ ] Test the component

---

## 💡 Pro Tips

### Find & Replace Strategy

Use your IDE's find/replace across files:

1. **Find:** `from 'react-router'`  
   **Replace:** Check each file individually

2. **Find:** `useNavigate\(\)`  
   **Replace:** `useRouter()` (after updating import)

3. **Find:** `navigate\(`  
   **Replace:** `router.push(`

4. **Find:** `<Link to=`  
   **Replace:** `<Link href=`

5. **Find:** `useLocation\(\)`  
   **Replace:** `usePathname()`

### Verify Changes

After each file update:
```bash
npm run dev
# Test the affected page
# Check browser console for errors
```

---

**Ready to migrate?** Use these examples as your guide! 🚀
