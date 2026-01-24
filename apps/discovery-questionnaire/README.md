# ERP Discovery Questionnaire

A secure, client-facing discovery questionnaire application to support NetSuite vs Microsoft Dynamics 365 Business Central evaluation.

## Purpose

This questionnaire is designed to gather high-quality context before an on-site discovery workshop. It helps surface key signals that inform ERP platform comparison, including:

- Multi-entity complexity and consolidation needs
- Integration volume and real-time requirements
- Configuration vs customisation tolerance
- Reporting and analytics maturity
- Future scale and complexity

**Note:** This questionnaire does NOT make platform recommendations. It gathers context to support a balanced, defensible comparison.

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Frontend:** React 18
- **Authentication:** Azure AD / Entra ID (MSAL)
- **Persistence:** Azure Table Storage
- **Styling:** Tailwind CSS
- **Hosting Target:** Azure App Service or Azure Static Web Apps

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Azure AD App Registration with:
  - Client ID
  - Tenant ID
  - Redirect URI configured
- Azure Storage Account (for Table Storage)

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Azure AD / MSAL Configuration
   NEXT_PUBLIC_AZURE_CLIENT_ID=your-client-id
   NEXT_PUBLIC_AZURE_TENANT_ID=your-tenant-id
   NEXT_PUBLIC_AZURE_REDIRECT_URI=http://localhost:3001

   # Client Email Domain Restriction
   # Option 1: Multiple domains (comma-separated, recommended)
   NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS=clientdomain.com,cmnl.com.au
   # Option 2: Single domain (fallback for backward compatibility)
   # NEXT_PUBLIC_CLIENT_EMAIL_DOMAIN=clientdomain.com

   # Azure Storage (for Table Storage)
   AZURE_STORAGE_ACCOUNT_NAME=your-storage-account
   AZURE_STORAGE_ACCOUNT_KEY=your-storage-key
   ```

3. **Azure AD App Registration Setup**

   In Azure Portal:
   - Register a new app in Azure AD / Entra ID
   - Add a redirect URI: `http://localhost:3001` (for local dev)
   - Enable B2B guest access if needed
   - Grant "User.Read" API permission (Microsoft Graph)

4. **Azure Storage Setup**

   - Create an Azure Storage Account
   - Create a table named `questionnaireresponses`
   - Copy the storage account name and key

5. **Run Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3001](http://localhost:3001) in your browser.

### Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Azure Deployment

### GitHub Actions CI/CD Setup

The repository includes a GitHub Actions workflow (`.github/workflows/main_rg-discovery-questionnaire-dev.yml`) that automatically builds and deploys to Azure App Service on push to `main`.

#### Required GitHub Secrets

The workflow uses Azure OIDC authentication and requires the following secrets in GitHub:

1. **Go to:** Repository → Settings → Secrets and variables → Actions
2. **Add these secrets:**

   | Secret Name | Description | Where to Get Value |
   |------------|-------------|-------------------|
   | `AZURE_CLIENT_ID` | Azure service principal/client ID | Copy from existing `AZUREAPPSERVICE_CLIENTID_<GUID>` secret (if Azure Deployment Center created it) |
   | `AZURE_TENANT_ID` | Azure AD tenant ID | Copy from existing `AZUREAPPSERVICE_TENANTID_<GUID>` secret |
   | `AZURE_SUBSCRIPTION_ID` | Azure subscription ID | Copy from existing `AZUREAPPSERVICE_SUBSCRIPTIONID_<GUID>` secret |

3. **If Azure Deployment Center created secrets with `AZUREAPPSERVICE_*` names:**
   - Do NOT delete the existing `AZUREAPPSERVICE_*` secrets
   - Create new secrets with the standard names above
   - Copy the **values** from the `AZUREAPPSERVICE_*` secrets
   - The Client ID GUID can be extracted from the secret name if needed

4. **Additional secrets required for the build:**
   - `AZURE_REDIRECT_URI` - Production redirect URI (e.g., `https://your-app.azurewebsites.net`)
   - `ALLOWED_EMAIL_DOMAINS` - Allowed email domains (comma-separated, e.g., `clientdomain.com,cmnl.com.au`) or `CLIENT_EMAIL_DOMAIN` for single domain
   - `AZURE_STORAGE_ACCOUNT_NAME` - Azure Storage account name
   - `AZURE_STORAGE_ACCOUNT_KEY` - Azure Storage account key

#### Workflow Behavior

- **Triggers:** Automatically runs on push to `main` when files in `apps/discovery-questionnaire/` change
- **Build:** Runs `npm ci` and `npm run build` in the app directory
- **Deploy:** Uses Azure OIDC login and deploys to `rg-discovery-questionnaire-dev` App Service
- **Manual trigger:** Can be manually triggered via GitHub Actions UI (workflow_dispatch)

### Option 1: Azure App Service

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Create App Service**
   - Create a new Web App in Azure Portal
   - Choose Node.js runtime stack
   - Configure deployment (GitHub Actions, Azure DevOps, or ZIP deploy)

3. **Configure Application Settings**
   - Add all environment variables from `.env.local` as App Settings
   - Update `NEXT_PUBLIC_AZURE_REDIRECT_URI` to production URL

4. **Deploy**
   - Use Azure CLI, GitHub Actions, or Azure DevOps pipeline
   - Or use ZIP deploy: `az webapp deployment source config-zip`

### Option 2: Azure Static Web Apps

1. **Create Static Web App**
   - Create resource in Azure Portal
   - Connect to GitHub repository (if using)

2. **Configure Build Settings**
   - Build command: `npm run build`
   - App artifact location: `.next`

3. **Configure Environment Variables**
   - Add all environment variables in Configuration
   - Note: Static Web Apps may require API routes to be deployed separately

### Post-Deployment Configuration

1. **Update Azure AD Redirect URI**
   - Add production URL to Azure AD app registration
   - Update `NEXT_PUBLIC_AZURE_REDIRECT_URI` in App Settings

2. **Domain Restriction**
   - Set `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS` (comma-separated, e.g., `clientdomain.com,cmnl.com.au`) for multiple domains
   - Or set `NEXT_PUBLIC_CLIENT_EMAIL_DOMAIN` for a single domain (backward compatibility)
   - Domain comparison is case-insensitive and handles whitespace automatically
   - Only users with email addresses from allowed domains can access

3. **Storage Account**
   - Ensure table `questionnaireresponses` exists
   - Verify connection string/key is correct

## Security Considerations

### Authentication
- Azure AD / Entra ID authentication required
- Domain restriction enforced (client email domain only)
- B2B guest access must be enabled in Entra ID if needed

### Data Storage
- Responses stored in Azure Table Storage
- Partition key: "responses"
- Row key: User ID (from Azure AD)
- No anonymous access

### Network
- HTTPS required in production
- CORS configured for Azure AD redirects
- No public endpoints without authentication

## Application Structure

```
apps/discovery-questionnaire/
├── app/
│   ├── api/
│   │   └── responses/        # API routes for data persistence
│   ├── questionnaire/       # Main questionnaire page
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Landing/login page
│   └── providers.tsx         # MSAL provider wrapper
├── components/
│   ├── ProgressBar.tsx       # Progress indicator
│   ├── QuestionRenderer.tsx # Question type renderers
│   ├── SaveIndicator.tsx     # Auto-save status
│   └── SectionNavigation.tsx # Sidebar navigation
├── lib/
│   ├── questions.ts          # Questionnaire structure
│   ├── msalConfig.ts         # Azure AD configuration
│   └── storage.ts            # Azure Table Storage client
├── types/
│   └── index.ts              # TypeScript type definitions
└── README.md                 # This file
```

## Questionnaire Structure

The questionnaire consists of 10 sections:

1. **Organisation & Entity Structure** (6 min)
2. **Finance & Accounting Complexity** (7 min)
3. **Operations (Hospitality, Gaming, POS)** (8 min)
4. **Procure to Pay & Expenses** (6 min)
5. **Payroll & Workforce** (5 min)
6. **Reporting, BI & FP&A** (7 min)
7. **Integrations & Data Architecture** (9 min)
8. **Risk, Compliance & Governance** (5 min)
9. **Growth, Scalability & Strategy** (5 min)
10. **Decision Criteria & Priorities** (4 min)

**Total estimated time:** 45-60 minutes

## Data Model

Responses are stored in Azure Table Storage with the following structure:

- **Partition Key:** "responses"
- **Row Key:** User ID (from Azure AD)
- **Sections:** Object containing section states with answers
- **Progress:** Calculated completion percentage and current section
- **Metadata:** User email, name, timestamps

See `data-model.md` for detailed schema.

## Features

- ✅ Azure AD / Entra ID authentication
- ✅ Domain-based access restriction
- ✅ Auto-save on every field change (debounced)
- ✅ Progress tracking with visual indicator
- ✅ Section-level completion tracking
- ✅ Resume capability (saves progress)
- ✅ Responsive design (desktop + tablet)
- ✅ Multiple question types (choice, select, scale, text, date, etc.)
- ✅ Helper text for each question
- ✅ Validation for required fields

## Troubleshooting

### Authentication Issues
- Verify Azure AD app registration is correct
- Check redirect URI matches exactly
- Ensure B2B guest access is enabled if needed
- Verify domain restriction is working

### Storage Issues
- Verify Azure Storage account name and key
- Ensure table `questionnaireresponses` exists
- Check network connectivity to Azure

### Build Issues
- Run `npm install` to ensure dependencies are installed
- Check Node.js version (18+ required)
- Verify TypeScript configuration

## Support

For issues or questions, contact the development team.

## License

Proprietary - Internal use only.
