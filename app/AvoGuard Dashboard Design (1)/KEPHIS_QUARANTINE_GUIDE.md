# 🛡️ KEPHIS Quarantine Surveillance Dashboard

## Overview

The KEPHIS Quarantine Surveillance dashboard is a specialized biosecurity monitoring tool designed for Kenya Plant Health Inspectorate Service (KEPHIS) oversight of quarantine pests in avocado production.

---

## 🎯 Purpose

Monitor and manage quarantine pest outbreaks (FCM - False Codling Moth and Fruit Fly) to ensure compliance with national and international phytosanitary regulations for avocado exports.

---

## 🎨 Design System

### Typography
- **Header:** DM Serif Display - "National Plant Health Surveillance"
- **Sub-header:** IBM Plex Sans - "Live Oversight of Quarantine Pests (FCM / Fruit Fly)"
- **Block IDs:** IBM Plex Mono (monospace) for clear identification
- **Body text:** IBM Plex Sans

### Color Palette
- **Forest Green (#1B4332):** Primary brand color, cleared blocks
- **Cream (#F7F4EF):** Background
- **Red (#C0392B):** ⚠️ Quarantine alerts, gated blocks, FCM highlights
- **Amber (#F39C12):** Pending inspections
- **White (#FFFFFF):** Card backgrounds

### Special Styling
- All FCM (False Codling Moth) data highlighted in **Red (#C0392B)** for immediate attention
- Movement Restricted status uses red pills
- Export Cleared status uses green pills
- Under Review status uses amber pills

---

## 📊 Features

### 1. High-Level Metrics (3 Cards)

#### Active Gated Blocks (Red)
- **Color:** Red border (#C0392B)
- **Icon:** AlertTriangle
- **Shows:** Number of blocks with movement restrictions
- **Description:** "Movement restricted due to pest detection"

#### Pest-Free Blocks (Green)
- **Color:** Green border (#2D6A4F)
- **Icon:** CheckCircle
- **Shows:** Number of blocks cleared for export
- **Description:** "Cleared for export operations"

#### Pending Inspections (Amber)
- **Color:** Amber border (#F39C12)
- **Icon:** Clock
- **Shows:** Number of blocks awaiting KEPHIS certification
- **Description:** "Awaiting KEPHIS certification"

---

### 2. Search & Filter Tools

**Search Bar:**
- Search by Block ID, Farm Name, or County
- Real-time filtering

**Status Filter Dropdown:**
- All Statuses
- Movement Restricted (gated)
- Export Cleared (cleared)
- Under Review (pending)

---

### 3. Specialized Quarantine Table

#### Columns:

1. **Checkbox** - Select for bulk actions
2. **Block ID** - Unique identifier (IBM Plex Mono)
   - Format: BLK-XXX-###
   - Example: BLK-KMB-001

3. **Farm Name** - Farm/estate name
   - Kenyan farm names
   - Example: "Kiambu Highlands Estate"

4. **County** - Kenyan county
   - Kiambu, Meru, Nyeri, Embu, Kirinyaga

5. **Pest Type** - Quarantine pest detected
   - FCM (highlighted in red)
   - Fruit Fly (highlighted in amber)

6. **Capture Rate** - Pest trap captures
   - Format: X.X per trap
   - Color coding:
     - **Red:** >10.0 (high risk)
     - **Amber:** 0.1-10.0 (moderate)
     - **Green:** 0.0 (pest-free)

7. **Last Visual Inspection** - Date of last KEPHIS inspection
   - Format: DD MMM YYYY
   - Example: "15 Mar 2026"

8. **Inspector** - KEPHIS official
   - Example: "Dr. James Mwangi"

9. **KEPHIS Clearance Status** - Official status pills
   - **Movement Restricted** (Red pill with AlertTriangle icon)
   - **Export Cleared** (Green pill with CheckCircle icon)
   - **Under Review** (Amber pill with Clock icon)

10. **Actions** - Interactive row actions
    - **View Details** - See complete block information
    - **View History** - Access inspection records
    - **Issue Permit** - Generate movement permit

---

### 4. Bulk Actions

**Issue Digital Movement Permit Button:**
- Enabled when blocks are selected
- Shows count: "(X)" selected blocks
- Green background when active
- Disabled/gray when no selection

**Export Report Button:**
- Download surveillance data
- White background with border
- Available anytime

---

### 5. Review Block Details
1. Scan table for specific information
2. Check capture rates (color-coded)
3. Verify inspector and inspection date
4. Review KEPHIS clearance status

### 6. Use Row Actions
**View Details Button:**
1. Click "View Details" on any row
2. See complete block information
3. Review all pest and inspection data

**View History Button:**
1. Click "View History" on any row
2. Access past inspection records
3. See historical capture rates
4. Review treatment timeline and status changes

**Issue Permit Button:**
1. Click "Issue Permit" on individual block
2. System checks clearance status:
   - **Cleared:** Issues 30-day movement permit
   - **Gated:** Shows restriction reason and inspector contact
   - **Pending:** Shows awaiting clearance message

---

### 5. Quarantine Alert Footer

Red-bordered alert box with:
- AlertTriangle icon
- **Title:** "Quarantine Pest Alert"
- **Message:** Information about movement restrictions and KEPHIS regulations

---

## 🔢 Sample Data

The dashboard includes 10 sample blocks across 5 Kenyan counties:

| Block ID | Farm | County | Pest Type | Capture Rate | Status |
|----------|------|--------|-----------|--------------|--------|
| BLK-KMB-001 | Kiambu Highlands Estate | Kiambu | FCM | 12.5 | Gated |
| BLK-MRU-034 | Meru Central Farm | Meru | Fruit Fly | 3.2 | Pending |
| BLK-NYR-018 | Nyeri Green Orchards | Nyeri | FCM | 0.0 | Cleared |
| BLK-KMB-089 | Kangema Avocado Growers | Kiambu | FCM | 18.7 | Gated |
| BLK-EMB-022 | Embu Valley Farms | Embu | Fruit Fly | 5.8 | Pending |
| BLK-KRC-045 | Kirinyaga Export Hub | Kirinyaga | FCM | 0.0 | Cleared |
| BLK-MRU-067 | Meru Premium Avocados | Meru | FCM | 22.3 | Gated |
| BLK-NYR-091 | Nyeri Mountain Estates | Nyeri | Fruit Fly | 1.5 | Pending |
| BLK-KMB-102 | Thika Premium Growers | Kiambu | FCM | 0.0 | Cleared |
| BLK-EMB-078 | Embu Organic Farms | Embu | FCM | 9.4 | Gated |

---

## 🚦 Status Definitions

### Movement Restricted (Gated)
- **Color:** Red (#C0392B)
- **Meaning:** Pest detection above threshold
- **Action Required:** Digital Movement Permit needed for produce transport
- **Icon:** AlertTriangle

### Export Cleared
- **Color:** Green (#2D6A4F)
- **Meaning:** No quarantine pests detected, or below threshold
- **Action Required:** None - normal export operations
- **Icon:** CheckCircle

### Under Review (Pending)
- **Color:** Amber (#F39C12)
- **Meaning:** Recent inspection, awaiting final certification
- **Action Required:** Wait for KEPHIS decision
- **Icon:** Clock

---

## 📱 Responsive Design

- **Desktop optimized:** 1440x1024 layout
- **Table scrolls horizontally** on smaller screens
- **Collapsible sidebar** for more space
- **Dense table design** for maximum data visibility

---

## 🔐 Kenyan Context

### Authentic Kenyan Elements:

**Counties Featured:**
- Kiambu
- Meru
- Nyeri
- Embu
- Kirinyaga

**Kenyan Inspector Names:**
- Dr. James Mwangi
- Dr. Sarah Njeri
- Dr. Peter Kariuki
- Dr. Grace Wambui

**Kenyan Farm Names:**
- Kiambu Highlands Estate
- Kangema Avocado Growers
- Meru Central Farm
- Nyeri Green Orchards
- Embu Valley Farms
- Kirinyaga Export Hub
- Thika Premium Growers

---

## 🛠️ Technical Implementation

### File Location
```
/src/app/pages/KEPHISQuarantine.tsx
```

### Route
```
/kephis-quarantine
```

### Navigation
- Added to sidebar with Shield icon
- Positioned after "Outbreak Monitoring"
- Breadcrumb: Dashboard > KEPHIS Quarantine

### State Management
- Local state with React hooks
- Checkbox selection tracking
- Search and filter state
- Bulk action handling

---

## 🎯 User Workflows

### 1. Monitor Quarantine Status
1. View high-level metrics at top
2. Identify number of gated blocks
3. See pending inspections count

### 2. Search for Specific Block
1. Use search bar to find block by ID, farm, or county
2. Or use status filter dropdown

### 3. Issue Movement Permits
1. Select blocks using checkboxes
2. Click "Issue Digital Movement Permit"
3. System shows confirmation with selected blocks

### 4. Export Surveillance Report
1. Click "Export Report" button
2. Download comprehensive data

### 5. Review Block Details
1. Scan table for specific information
2. Check capture rates (color-coded)
3. Verify inspector and inspection date
4. Review KEPHIS clearance status

### 6. Use Row Actions
**View Details Button:**
1. Click "View Details" on any row
2. See complete block information
3. Review all pest and inspection data

**View History Button:**
1. Click "View History" on any row
2. Access past inspection records
3. See historical capture rates
4. Review treatment timeline and status changes

**Issue Permit Button:**
1. Click "Issue Permit" on individual block
2. System checks clearance status:
   - **Cleared:** Issues 30-day movement permit
   - **Gated:** Shows restriction reason and inspector contact
   - **Pending:** Shows awaiting clearance message

---

## 🔴 Red Alert System

All FCM-related data uses **Red (#C0392B)** for immediate visibility:

1. **FCM Pest Type Badge** - Red background
2. **High Capture Rates** - Red text (>10 per trap)
3. **Gated Block Status** - Red pill badge
4. **Active Gated Blocks Metric** - Red border and icon
5. **Alert Footer** - Red border and text

This ensures biosecurity threats are instantly recognizable.

---

## 📋 Compliance Features

### KEPHIS Integration Ready
- Digital Movement Permit workflow
- Inspector assignment tracking
- Inspection date logging
- Official status certification

### Export Compliance
- Clear visual indicators
- Bulk permit issuance
- Traceability support
- Report generation

### Biosecurity Protocol
- Immediate visual alerts for FCM
- Capture rate thresholds
- Movement restriction enforcement
- Phytosanitary standards compliance

---

## 🌟 Key Benefits

1. **National Oversight** - Centralized quarantine monitoring
2. **Export Protection** - Prevents pest spread, protects markets
3. **Real-time Status** - Live surveillance data
4. **Bulk Operations** - Efficient permit processing
5. **Kenyan Context** - Authentic local data and workflows
6. **Regulatory Compliance** - KEPHIS standard adherence
7. **Visual Alerts** - Red highlighting for critical pests (FCM)
8. **Traceability** - Full audit trail with inspectors and dates

---

## 🚀 Future Enhancements

Potential additions:
- GPS coordinates for blocks
- Historical trap data charts
- Pest trend analysis
- Mobile app for field inspectors
- PDF permit generation
- SMS alerts for status changes
- Integration with KEPHIS database
- Weather correlation data
- Treatment recommendation engine

---

## 📞 KEPHIS Contact Integration

The footer note includes guidance:
> "Contact your local KEPHIS inspector for clearance procedures."

This maintains the connection to official regulatory processes.

---

## ✅ Accessibility

- Clear color contrast ratios
- Icon + text labels
- Keyboard navigation support
- Screen reader friendly
- Status indicators use color + icons (not color alone)

---

**The KEPHIS Quarantine Surveillance dashboard provides critical biosecurity oversight for Kenya's avocado export industry.** 🥑🛡️