# 🏛️ HCDA Traceability Registry Dashboard

## Overview

The HCDA (Horticultural Crops Directorate of Agriculture) Traceability Registry is a comprehensive farmer registration and GlobalGAP compliance tracking system for Kenya's avocado export industry.

---

## 🎯 Purpose

Track registered avocado farmers, monitor GlobalGAP certification compliance, map farm locations, and manage exporter relationships to ensure traceability and market access for Kenyan avocado exports.

---

## 🎨 Design System

### Typography
- **Header:** DM Serif Display - "Horticultural Crops Traceability Registry"
- **Sub-header:** IBM Plex Sans - "Verified Farmer Registration & GlobalGAP Compliance"
- **HCDA Reg Numbers:** IBM Plex Mono (monospace) for clear identification
- **Body text:** IBM Plex Sans

### Color Palette
- **Forest Green (#1B4332):** Primary brand color, table headers
- **Cream (#F7F4EF):** Page background, zebra stripes
- **White (#FFFFFF):** Card backgrounds
- **Compliant Green (#2D6A4F):** GlobalGAP compliant status
- **Expired Amber (#F39C12):** Expired certifications
- **Non-Compliant Red (#C0392B):** Non-compliant status

### Special Styling
- **Zebra-striped rows** for enhanced readability in dense data view
- **HCDA logo placeholder** (Building2 icon in green box)
- **Left filter panel** for advanced filtering
- **Interactive map thumbnail** showing farm locations

---

## 📊 Features

### 1. High-Level Metrics (4 Cards)

#### Total Registered Farmers
- **Icon:** FileCheck
- **Shows:** Total count of HCDA registered farmers
- **Description:** "Active HCDA farmers"

#### GlobalGAP Compliant
- **Color:** Green (#2D6A4F)
- **Icon:** CheckCircle
- **Shows:** Number of compliant farmers with percentage
- **Description:** "X% of total"

#### Expired / Non-Compliant
- **Color:** Red (#C0392B)
- **Icon:** XCircle
- **Shows:** Combined count needing renewal
- **Description:** "Requires renewal"

#### Total Acreage
- **Icon:** TrendingUp
- **Shows:** Total hectares under cultivation
- **Description:** "Hectares under cultivation"

---

### 2. Left Filter Panel

**Filter by Exporter:**
- Radio button selection
- Options:
  - All Exporters
  - Kakuzi PLC
  - Sunripe Ltd
  - Kenya Horticultural Exporters
  - Fresh Produce Exporters

**Filter by GlobalGAP Status:**
- Radio button selection
- Options:
  - All Statuses
  - Compliant (Green)
  - Expired (Amber)
  - Non-Compliant (Red)

**Map Thumbnail:**
- Title: "Farm Distribution Map"
- Interactive dots representing registered farms
- Color-coded by GlobalGAP status
- Shows count: "X Registered Farms"
- Each dot represents a farm location

---

### 3. Specialized Registry Table

#### Columns:

1. **Farmer Name**
   - Kenyan farmer names
   - Bold font weight
   - Example: "Joseph Kamau"

2. **HCDA Reg. #** (IBM Plex Mono)
   - Format: HCDA-XXX-YYYY-####
   - Example: HCDA-KMB-2024-0047
   - Green color (#1B4332)
   - Monospace font for easy scanning

3. **Location (Ward/County)**
   - MapPin icon
   - Ward name (primary)
   - County name (secondary, smaller text)
   - Example: "Gatundu North, Kiambu County"

4. **Acreage**
   - Format: X.X ha
   - Bold font
   - Example: "12.5 ha"

5. **GlobalGAP Status**
   - Status pill with icon
   - **Compliant:** Green pill with CheckCircle
   - **Expired:** Amber pill with Clock
   - **Non-Compliant:** Red pill with XCircle
   - Expiry date below status
   - Format: "Exp: DD MMM YYYY"

6. **Primary Exporter**
   - Company name
   - Links farmer to export market

---

### 4. Search & Export Tools

**Search Bar:**
- Search by:
  - Farmer Name
  - HCDA Registration Number
  - Ward
  - County
- Real-time filtering
- Search icon

**Export Registry Button:**
- Download complete registry data
- White background with border
- Download icon

---

### 5. Zebra Striping

**Enhanced Readability:**
- Even rows: White (#FFFFFF)
- Odd rows: Cream (#F7F4EF)
- Subtle alternating pattern
- Hover effect on all rows

---

## 🗺️ Map Thumbnail Features

**Interactive Map Element:**
- Shows farm locations as colored dots
- Dots colored by GlobalGAP status:
  - Green: Compliant
  - Amber: Expired
  - Red: Non-Compliant
- Pseudo-geographic distribution
- Displays count of visible farms
- Positioned in left panel for context

---

## 🔢 Sample Data

The registry includes 12 sample farmers across 5 Kenyan counties:

| Farmer | HCDA Reg # | Ward | County | Acreage | Status | Exporter |
|--------|-----------|------|--------|---------|--------|----------|
| Joseph Kamau | HCDA-KMB-2024-0047 | Gatundu North | Kiambu | 12.5 ha | Compliant | Kakuzi PLC |
| Mary Wanjiku | HCDA-MRU-2023-0128 | Timau | Meru | 8.3 ha | Expired | Sunripe Ltd |
| Peter Mwangi | HCDA-NYR-2024-0089 | Tetu | Nyeri | 15.0 ha | Compliant | Kakuzi PLC |
| Grace Njeri | HCDA-EMB-2024-0034 | Mbeere North | Embu | 6.7 ha | Non-Compliant | Fresh Produce Exporters |
| David Kariuki | HCDA-KRC-2024-0156 | Ndia | Kirinyaga | 10.2 ha | Compliant | Kenya Horticultural Exporters |
| Sarah Wambui | HCDA-KMB-2023-0201 | Limuru | Kiambu | 22.4 ha | Compliant | Kakuzi PLC |
| John Mutua | HCDA-MRU-2024-0067 | Buuri | Meru | 5.8 ha | Expired | Sunripe Ltd |
| Lucy Wairimu | HCDA-NYR-2024-0112 | Mathira East | Nyeri | 18.6 ha | Compliant | Kenya Horticultural Exporters |
| Daniel Ochieng | HCDA-EMB-2024-0078 | Runyenjes | Embu | 9.1 ha | Compliant | Fresh Produce Exporters |
| Anne Nyambura | HCDA-KMB-2024-0188 | Kikuyu | Kiambu | 14.3 ha | Non-Compliant | Kakuzi PLC |
| Samuel Kipchoge | HCDA-KRC-2023-0234 | Gichugu | Kirinyaga | 7.9 ha | Expired | Kenya Horticultural Exporters |
| Faith Moraa | HCDA-MRU-2024-0145 | Igembe South | Meru | 11.7 ha | Compliant | Sunripe Ltd |

**Statistics:**
- Total Farmers: 12
- Compliant: 6 (50%)
- Expired: 3 (25%)
- Non-Compliant: 2 (17%)
- Total Acreage: 141.3 hectares

---

## 🚦 GlobalGAP Status Definitions

### Compliant
- **Color:** Green (#2D6A4F)
- **Icon:** CheckCircle
- **Meaning:** Valid GlobalGAP certification, cleared for export
- **Action:** None - continue operations

### Expired
- **Color:** Amber (#F39C12)
- **Icon:** Clock
- **Meaning:** Certification has expired, renewal needed
- **Action:** Contact certification body for renewal

### Non-Compliant
- **Color:** Red (#C0392B)
- **Icon:** XCircle
- **Meaning:** Failed audit or major non-conformance
- **Action:** Corrective action required before export

---

## 🌍 Kenyan Context

### Authentic Counties Featured:
1. **Kiambu** - Central Kenya, major avocado production
2. **Meru** - Eastern slopes of Mt. Kenya
3. **Nyeri** - Central highlands, high-quality produce
4. **Embu** - Eastern Kenya, fertile soils
5. **Kirinyaga** - Central region, export-oriented

### Authentic Wards:
- Gatundu North (Kiambu)
- Timau (Meru)
- Tetu (Nyeri)
- Mbeere North (Embu)
- Ndia (Kirinyaga)
- Limuru (Kiambu)
- Buuri (Meru)
- Mathira East (Nyeri)
- Runyenjes (Embu)
- Kikuyu (Kiambu)
- Gichugu (Kirinyaga)
- Igembe South (Meru)

### Real Kenyan Exporters:
- **Kakuzi PLC** - Major Kenyan agricultural exporter
- **Sunripe Ltd** - Fresh produce exporter
- **Kenya Horticultural Exporters** - Industry cooperative
- **Fresh Produce Exporters** - Regional exporter

### Authentic Farmer Names:
- Joseph Kamau
- Mary Wanjiku
- Peter Mwangi
- Grace Njeri
- David Kariuki
- Sarah Wambui
- John Mutua
- Lucy Wairimu
- Daniel Ochieng
- Anne Nyambura
- Samuel Kipchoge
- Faith Moraa

---

## 🛠️ Technical Implementation

### File Location
```
/src/app/pages/HCDARegistry.tsx
```

### Route
```
/hcda-registry
```

### Navigation
- Added to sidebar with Building2 icon
- Sidebar label: "HCDA"
- Full title in page: "Horticultural Crops Traceability Registry"
- Positioned after "KEPHIS"
- Breadcrumb: Dashboard > HCDA Registry

### Layout
- **12-column grid**
- Left panel: 3 columns (filters + map)
- Right content: 9 columns (table + search)
- Sticky filter panel on scroll

### State Management
- Local state with React hooks
- Search filtering
- Exporter filtering (radio buttons)
- GlobalGAP status filtering (radio buttons)
- Real-time results update

---

## 🎯 User Workflows

### 1. View All Registered Farmers
1. Navigate to HCDA from sidebar
2. View high-level metrics at top
3. Scroll through complete registry table
4. Note zebra striping for easy reading

### 2. Filter by Exporter
1. Use left panel "Filter by Exporter"
2. Select specific exporter
3. Table updates to show only that exporter's farmers
4. Map updates to show relevant locations

### 3. Filter by GlobalGAP Status
1. Use left panel "Filter by GlobalGAP Status"
2. Select status (Compliant/Expired/Non-Compliant)
3. Table shows only matching farmers
4. Review compliance levels

### 4. Search for Specific Farmer
1. Use search bar at top of table
2. Type farmer name, registration number, ward, or county
3. Results filter in real-time

### 5. View Farm Distribution
1. Check map thumbnail in left panel
2. See geographic spread of registered farms
3. Color-coded dots show compliance status
4. Visual overview of registry coverage

### 6. Export Registry Data
1. Click "Export Registry" button
2. Download complete dataset
3. Use for reporting or analysis

---

## 📋 Compliance Features

### HCDA Registration Tracking
- Unique registration numbers
- County-level organization
- Ward-level precision
- Acreage documentation

### GlobalGAP Certification Management
- Status tracking (Compliant/Expired/Non-Compliant)
- Expiry date monitoring
- Visual status indicators
- Compliance percentage calculation

### Exporter Relationship Management
- Primary exporter assignment
- Export channel visibility
- Market access tracking
- Supply chain traceability

### Traceability Support
- Full farmer registry
- Location data (county + ward)
- Farm size documentation
- Certification status
- Export pathway tracking

---

## 📱 Responsive Design

- **Desktop optimized:** 1440x1024 layout
- **Fixed left panel:** 3-column filter sidebar
- **Scrollable table:** Horizontal scroll if needed
- **Sticky filter panel:** Remains visible on scroll
- **Collapsible sidebar:** Works with main navigation

---

## 🎨 Visual Hierarchy

### Header Section:
- HCDA logo placeholder (green Building2 icon)
- Large serif title
- Descriptive subtitle

### Metrics Row:
- 4 equal-width cards
- Icon + number + description
- Color-coded by importance

### Left Panel:
- Filter controls grouped logically
- Map thumbnail at bottom
- Sticky positioning
- White background with border

### Right Content:
- Search + export tools
- Full-width table
- Zebra striping
- Results count

---

## 🌟 Key Benefits

1. **Farmer Registry** - Complete HCDA registered farmer database
2. **Compliance Tracking** - GlobalGAP certification monitoring
3. **Geographic Visibility** - Map view of farm distribution
4. **Exporter Management** - Track farmer-exporter relationships
5. **Traceability** - Full supply chain documentation
6. **Market Access** - Ensure export readiness
7. **Kenyan Context** - Authentic local data and structures
8. **Easy Navigation** - Filters + search for quick access
9. **Dense Data View** - Zebra stripes for readability
10. **Export Ready** - Download registry data

---

## 🚀 Future Enhancements

Potential additions:
- Full interactive map with click-to-zoom
- Historical certification records
- Audit trail documentation
- Mobile certification verification
- QR code generation for farmers
- GlobalGAP audit scheduling
- Document upload (certificates)
- Multi-exporter support
- Production volume tracking
- Quality grade recording
- Export shipment linking
- SMS notifications for expiry
- PDF certificate viewer
- Farm photo gallery
- Weather data integration

---

## 📊 Data Integrity

### Registration Number Format:
```
HCDA-[COUNTY]-[YEAR]-[NUMBER]

Examples:
HCDA-KMB-2024-0047  (Kiambu, 2024, #47)
HCDA-MRU-2023-0128  (Meru, 2023, #128)
HCDA-NYR-2024-0089  (Nyeri, 2024, #89)
```

### County Codes:
- KMB = Kiambu
- MRU = Meru
- NYR = Nyeri
- EMB = Embu
- KRC = Kirinyaga

---

## ✅ Accessibility

- Clear color contrast
- Icon + text labels
- Status uses color + icons (not color alone)
- Keyboard navigation support
- Screen reader friendly
- Radio button controls
- Hover states on interactive elements

---

## 🔍 Search Functionality

**Searchable Fields:**
1. Farmer Name - Full text search
2. HCDA Registration Number - Exact or partial match
3. Ward - Location search
4. County - Regional search

**Search Behavior:**
- Case-insensitive
- Real-time filtering
- Multiple field matching
- Combines with filters
- Shows result count

---

## 🎯 Business Value

### For HCDA:
- Centralized farmer registry
- Compliance oversight
- Market access management
- Data-driven policy decisions

### For Farmers:
- Registration verification
- Certification status visibility
- Exporter connections
- Market readiness tracking

### For Exporters:
- Farmer pool visibility
- Compliance screening
- Supply planning
- Quality assurance

### For Regulators:
- Industry oversight
- Compliance monitoring
- Traceability enforcement
- Export market protection

---

**The HCDA Traceability Registry provides comprehensive farmer registration and GlobalGAP compliance management for Kenya's avocado export industry.** 🥑🏛️
