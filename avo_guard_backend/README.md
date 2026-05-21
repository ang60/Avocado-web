# AvoGuard Backend

AvoGuard is a digital platform for avocado farmers and agronomists to manage pest scouting, cases, and knowledge base.

## Core Entities

### 1. User Management
-   **Users**: Standard Django users extended with `phone_number` (primary ID), `role`, `entity`, `county`, `profile_picture`, and `managed_by`.
-   **Roles**: Define user capabilities (e.g., Farmer, Agronomist, Staff).
-   **App Permissions**: Granular permissions linked to roles.
-   **Entities**: Organizations like Exporters or Government agencies (KEPHIS, HCDA) that users belong to.
-   **Profile Picture**: Users can upload and manage their profile pictures via the `/api/users/upload_profile_picture/` endpoint.

### 2. KEPHIS Quarantine
-   **Quarantine Management**: Tracks farm blocks under quarantine with status (`gated`, `pending`, `cleared`), pest types, and inspection data.

## Roles & Permissions

-   **Farmer**: Can manage their own farm blocks and weekly records.
-   **Agronomist**: Can be assigned to cases, manage farmers linked to them, and access scouting reports.
-   **KEPHIS Inspector**: Can manage quarantine data and perform inspections.
-   **Exporter**: Can manage their own entity and view reports for their linked farmers.

## Features

### 1. User Management (`/api/`)
-   **Authentication**: Phone number based authentication using JWT.
-   **Roles & Permissions**: Support for dynamic roles and permissions.
 - **Registration & OTP**: Secure registration with OTP verification via SMS and Email.
 - **Farmer-Agronomist Linking**: Agronomists can initiate linking to farmers via the `/api/users/link_agronomist/` endpoint, requiring farmer OTP authorization. Farmers can also link themselves to an agronomist via the `/api/users/link_to_agronomist/` endpoint using an OTP.

### 2. Pest Scouting (`/api/pest-scouting/`)
-   **Farm Blocks**: Farmers can register and manage their farm blocks. The system tracks `farm_size` automatically based on the number of trees in all blocks.
-   **Weekly Records**: Recording of scouting data including pests, diseases, beneficial insects, and farm actions. Supports `multipart/form-data` for image and voice note uploads.
-   **Scouting Reports**: Aggregated reports accessible by farmers and agronomists.

### 3. Case Management (`/api/case-management/`)
-   **Cases**: Linked to pest scouting records. Supports status tracking ("Under Review", "Advisory Issued", "Closed").
-   **Advisories**: Supports categorizing advisories for better classification.
-   **Assignment**: Manual or automatic assignment of agronomists to cases.
-   **Notifications**: SMS alerts to agronomists upon assignment.
-   **Verification & Closing**: Agronomists can verify and close cases. The system tracks diagnosis, recommended chemical, application rate, and pre-harvest interval, which are persisted to the case record and sent to the farmer via SMS.

### 4. Knowledge Base (`/api/knowledge-base/`)
-   **Categories**: Categorized advisory content (e.g., Pest Management, Disease Management).
-   **Knowledge Entries**: Detailed articles with severity, tags, and active use cases.
-   **AI Agent**: Keyword-based AI assistant for querying the knowledge base.
-   **Material Counts**: Real-time count of materials and active use cases per category.

### 5. KEPHIS Quarantine & Risk Intelligence (`/api/kephis-quarantine/`)
-   **Quarantine CRUD**: Full management of quarantine blocks.
-   **Data Export**: Export quarantine reports in CSV format via `/api/kephis-quarantine/management/export_excel/`.
-   **Risk Intelligence**: Comprehensive summaries of exporter compliance and infection clusters via `/api/kephis-quarantine/management/risk_intelligence/`.
-   **Alerts**: Categorized alerts for better monitoring and management.

## API Documentation
The API is fully documented using Swagger and Redoc:
-   **Swagger UI**: `/api/schema/swagger-ui/`
-   **Redoc**: `/api/schema/redoc/`

## Accessing the System
-   **Admin Panel**: Accessible at `/admin/` for authorized staff.
-   **API Endpoints**: All API endpoints start with `/api/`.

## Key Endpoints
-   `POST /api/register/`: User registration.
-   `POST /api/login/`: User login to receive JWT tokens.
-   `GET /api/case-management/cases/`: List cases.
-   `POST /api/case-management/cases/{id}/assign_agronomist/`: Assign an agronomist to a case.
-   `POST /api/case-management/cases/{id}/verify_and_close/`: Close a case, save diagnosis/recommendations, and notify the farmer.
-   `POST /api/users/upload_profile_picture/`: Upload a profile picture for the authenticated user.
-   `POST /api/users/link_to_agronomist/`: Farmer-initiated link to an agronomist.
-   `POST /api/knowledge-base/entries/query/`: Query the AI agent.

## Implementation Details
-   **Framework**: Django 6.0.3 with Django REST Framework.
-   **Database**: PostgreSQL.
-   **SMS Integration**: Advanta Bulk SMS API.
-   **AI Integration**: Internal Knowledge Base Agent.
