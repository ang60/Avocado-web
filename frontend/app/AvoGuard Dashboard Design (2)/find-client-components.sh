#!/bin/bash

# Script to find components that need 'use client' directive
# These are files that use React hooks or browser APIs

echo "🔍 Finding components that need 'use client' directive..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📄 Files using useState:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep -r "useState" src/app/pages/ src/app/components/ --include="*.tsx" -l 2>/dev/null | sort
echo ""

echo "📄 Files using useEffect:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep -r "useEffect" src/app/pages/ src/app/components/ --include="*.tsx" -l 2>/dev/null | sort
echo ""

echo "📄 Files using React Router (need to be updated):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep -r "from 'react-router'" src/ --include="*.tsx" -l 2>/dev/null | sort
echo ""

echo "📄 Files with onClick handlers:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep -r "onClick=" src/app/pages/ src/app/components/ --include="*.tsx" -l 2>/dev/null | sort
echo ""

echo "📄 Context files (SidebarContext):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
find src/app/context/ -name "*.tsx" 2>/dev/null | sort
echo ""

echo "✅ SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "All files listed above need 'use client'; directive at the top"
echo ""
echo "To add 'use client' to a file:"
echo "  1. Open the file"
echo "  2. Add 'use client'; as the very first line"
echo "  3. Leave a blank line after it"
echo ""
echo "Example:"
echo "  'use client';"
echo "  "
echo "  import { useState } from 'react';"
echo "  ..."
echo ""
