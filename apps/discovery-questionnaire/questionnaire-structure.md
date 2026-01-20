# ERP Discovery Questionnaire Structure

## Overview
This questionnaire is designed to gather context for evaluating NetSuite vs Microsoft Dynamics 365 Business Central. It focuses on understanding business complexity, integration needs, and operational requirements—not making final design decisions.

**Target completion time:** 45-60 minutes total

---

## Section 1: Organisation & Entity Structure
**Estimated time: 5-7 minutes**

**Purpose:** Understand the multi-entity complexity, consolidation needs, and reporting structure. This helps determine if advanced multi-entity capabilities are required.

### Questions:
1. How many separate legal entities or subsidiaries do you operate?
   - Type: Multiple choice (1-2, 3-5, 6-10, 10+)
   - Helper: "This helps us understand consolidation complexity. Some systems handle multi-entity reporting better than others."

2. Do you need separate financial reporting (P&L, Balance Sheet) for each entity?
   - Type: Yes/No with follow-up
   - Follow-up: "How many entities need individual reporting?"
   - Helper: "Multi-entity consolidation is a key differentiator between ERP platforms."

3. Do you operate across multiple locations or sites?
   - Type: Yes/No with count
   - Helper: "Understanding your geographic footprint helps assess data access and performance requirements."

4. What is your current organisational structure?
   - Type: Multiple choice (Single entity, Multiple entities under one parent, Independent entities, Other)
   - Helper: "This impacts how we structure the ERP and reporting."

5. Do you have shared services or centralised functions across entities?
   - Type: Yes/No with examples (free text)
   - Helper: "Shared services often require inter-entity transactions and allocation methods."

---

## Section 2: Finance & Accounting Complexity
**Estimated time: 6-8 minutes**

**Purpose:** Assess financial complexity, chart of accounts structure, and accounting requirements. NetSuite typically handles complex multi-entity finance better.

### Questions:
1. How many chart of accounts segments do you currently use?
   - Type: Multiple choice (Simple single COA, Multiple COAs by entity, Segmented COA, Complex multi-dimensional)
   - Helper: "Chart of accounts complexity affects implementation effort and reporting flexibility."

2. What is your current accounting system?
   - Type: Multiple choice (Adept, MYOB, Xero, Sage, Other legacy system, Spreadsheets)
   - Helper: "Understanding your current system helps us plan migration complexity."

3. How many years of historical financial data do you need to migrate?
   - Type: Multiple choice (Opening balances only, 1-2 years, 3-5 years, 5+ years)
   - Helper: "Historical data migration affects timeline and cost."

4. Do you require multi-currency accounting?
   - Type: Yes/No with currency list
   - Helper: "Multi-currency is standard in modern ERPs, but complexity varies."

5. What is your financial reporting frequency?
   - Type: Multiple choice (Monthly, Quarterly, Annually, Real-time/Ad-hoc)
   - Helper: "Reporting frequency impacts system performance and user access patterns."

6. Do you have complex revenue recognition requirements?
   - Type: Scale 1-5 (Simple cash basis → Complex multi-element arrangements)
   - Helper: "Revenue recognition complexity can drive customisation needs."

7. How many open accounts payable and accounts receivable transactions do you typically have?
   - Type: Multiple choice (<100, 100-500, 500-2000, 2000+)
   - Helper: "Transaction volume affects migration planning and system performance."

---

## Section 3: Operations (Hospitality, Gaming, POS)
**Estimated time: 7-9 minutes**

**Purpose:** Understand operational complexity specific to RSL clubs—hospitality, gaming, and point-of-sale operations. These are industry-specific requirements.

### Questions:
1. How many point-of-sale (POS) locations do you operate?
   - Type: Number input with location types
   - Helper: "POS integration complexity varies significantly between ERP platforms."

2. What POS systems do you currently use?
   - Type: Multiple select (SwiftPOS, Other, None)
   - Follow-up: "Do you plan to keep SwiftPOS or replace it?"
   - Helper: "POS integration is critical for hospitality operations and affects ERP selection."

3. Do you operate gaming machines (pokies)?
   - Type: Yes/No
   - Follow-up: "What gaming system do you use?" (IGT Gaming, Other)
   - Helper: "Gaming system integration requires real-time transaction handling."

4. How many gaming machines do you operate across all locations?
   - Type: Number input
   - Helper: "Gaming transaction volume affects integration architecture."

5. Do you have kitchen/hospitality management systems?
   - Type: Yes/No
   - Follow-up: "Which system?" (Cooking the Books, Other)
   - Helper: "Kitchen systems often require inventory and cost management integration."

6. How do you currently track inventory across your operations?
   - Type: Multiple choice (Manual/spreadsheets, Separate inventory system, Part of POS, Not tracked)
   - Helper: "Inventory management complexity affects ERP module requirements."

7. What is your typical inventory turnover?
   - Type: Multiple choice (Daily, Weekly, Monthly, Seasonal)
   - Helper: "Inventory turnover frequency impacts real-time vs batch integration needs."

8. Do you need real-time inventory visibility across locations?
   - Type: Yes/No with scale (Nice to have → Critical)
   - Helper: "Real-time inventory requires robust integration architecture."

---

## Section 4: Procure to Pay & Expenses
**Estimated time: 5-7 minutes**

**Purpose:** Understand procurement processes, approval workflows, and expense management. This helps assess automation needs.

### Questions:
1. How do you currently manage purchase orders?
   - Type: Multiple choice (Paper-based, Email, Spreadsheet, System-based)
   - Helper: "PO automation is a key ERP benefit and affects implementation scope."

2. Do you have purchase approval workflows?
   - Type: Yes/No with complexity scale
   - Helper: "Approval workflows can be configured or require customisation depending on complexity."

3. Are you using or planning to use Medius for procure-to-pay?
   - Type: Yes/No with status (Planning, Partially deployed, Fully deployed)
   - Helper: "Medius integration affects ERP selection and implementation phasing."

4. How do you currently manage employee expenses?
   - Type: Multiple choice (Manual/paper, Email, Spreadsheet, System-based)
   - Helper: "Expense management automation reduces manual work and improves compliance."

5. How many purchase orders do you process per month?
   - Type: Multiple choice (<50, 50-200, 200-500, 500+)
   - Helper: "PO volume affects system performance and workflow design."

6. Do you need multi-level approval workflows?
   - Type: Yes/No with levels
   - Helper: "Complex approval workflows may require customisation."

---

## Section 5: Payroll & Workforce
**Estimated time: 5-6 minutes**

**Purpose:** Understand payroll complexity and workforce management needs. This affects integration requirements.

### Questions:
1. How many employees do you have across all entities?
   - Type: Number input
   - Helper: "Employee count affects licensing and integration volume."

2. What payroll system do you currently use?
   - Type: Multiple choice (MicroPay, Humanforce, Other, Manual)
   - Helper: "Payroll integration is typically required for accurate financial reporting."

3. Do you use time and attendance tracking?
   - Type: Yes/No
   - Follow-up: "Which system?" (Humanforce Time Target, Other)
   - Helper: "Time tracking integration affects labour cost allocation and reporting."

4. Do you need payroll integration with the ERP?
   - Type: Yes/No with requirements (free text)
   - Helper: "Payroll integration ensures accurate labour cost reporting and financial consolidation."

5. How many pay runs do you process per month?
   - Type: Multiple choice (Weekly, Fortnightly, Monthly, Multiple frequencies)
   - Helper: "Payroll frequency affects integration scheduling and data volume."

---

## Section 6: Reporting, BI & FP&A
**Estimated time: 6-8 minutes**

**Purpose:** Assess reporting maturity, BI needs, and financial planning requirements. NetSuite has stronger native analytics.

### Questions:
1. How many different reporting or BI tools do you currently use?
   - Type: Number input with tool names
   - Helper: "Multiple BI tools indicate a need for better integrated reporting."

2. What types of reports do you generate regularly?
   - Type: Multiple select (Financial statements, Operational dashboards, Management reports, Compliance reports, Ad-hoc analysis)
   - Helper: "Report types help determine if native ERP reporting is sufficient or if separate BI is needed."

3. Who needs access to financial reports?
   - Type: Multiple select (Finance team, Management, Board, External stakeholders, All staff)
   - Helper: "Report access requirements affect user licensing and security design."

4. Do you need real-time or near-real-time reporting?
   - Type: Yes/No with scale (Daily is fine → Real-time critical)
   - Helper: "Real-time reporting requires robust data architecture and may favour cloud-native solutions."

5. Do you do financial planning and forecasting?
   - Type: Yes/No with frequency (Annual budget, Quarterly forecasts, Rolling forecasts, Not currently)
   - Helper: "FP&A requirements may drive need for additional planning tools beyond core ERP."

6. Do you need scenario modeling or "what-if" analysis?
   - Type: Yes/No with complexity scale
   - Helper: "Advanced planning features vary significantly between ERP platforms."

7. Are you considering a data warehouse or data lake?
   - Type: Yes/No with approach (NetSuite analytics, Azure/Fabric, AWS, Other, Not sure)
   - Helper: "Data warehouse architecture affects long-term analytics capabilities and integration complexity."

---

## Section 7: Integrations & Data Architecture
**Estimated time: 8-10 minutes**

**Purpose:** Understand integration volume, complexity, and real-time requirements. This is a key differentiator between platforms.

### Questions:
1. How many external systems need to integrate with your ERP?
   - Type: Number input with system list (checkboxes: SwiftPOS, IGT Gaming, Humanforce, Medius, Cooking the Books, Bank feeds, Other)
   - Helper: "Integration count and complexity significantly impacts ERP selection and implementation cost."

2. What is your current integration approach?
   - Type: Multiple choice (Flat file transfers, APIs, Manual data entry, Mix of approaches)
   - Helper: "Current integration methods help us plan migration and modernisation."

3. Do you have an existing integration platform or middleware?
   - Type: Yes/No with platform name (IAPI Direct Services, Other, None)
   - Helper: "Existing integration platforms can be leveraged or may need replacement."

4. How many transactions do your integrations process per day?
   - Type: Multiple choice (<1,000, 1,000-10,000, 10,000-50,000, 50,000+)
   - Helper: "Transaction volume affects integration architecture and performance requirements."

5. Which integrations require real-time or near-real-time data?
   - Type: Multiple select from integration list
   - Helper: "Real-time requirements drive API-based integration architecture and may favour certain ERP platforms."

6. Which systems can continue using flat file transfers?
   - Type: Multiple select from integration list
   - Helper: "Flat file integrations are simpler but less flexible than APIs."

7. Do you need bank feed integration?
   - Type: Yes/No with bank count
   - Helper: "Bank feeds reduce manual reconciliation work and are standard in modern ERPs."

8. What is your data volume for integrations (transactions per day/week)?
   - Type: Free text with examples
   - Helper: "Data volume helps size integration infrastructure and affects cost."

9. Do you need API management or will you build point-to-point integrations?
   - Type: Multiple choice (Point-to-point is fine, Need API management layer, Not sure)
   - Helper: "API management becomes important with many integrations and affects architecture decisions."

---

## Section 8: Risk, Compliance & Governance
**Estimated time: 5-6 minutes**

**Purpose:** Understand compliance requirements, audit needs, and governance structure. Both platforms handle this well, but approaches differ.

### Questions:
1. What compliance or regulatory requirements do you need to meet?
   - Type: Multiple select (Gaming regulations, Financial reporting standards, Tax compliance, Industry-specific, Other)
   - Helper: "Compliance requirements affect system configuration and reporting needs."

2. Do you need audit trails and change tracking?
   - Type: Yes/No with requirements scale
   - Helper: "Audit trails are standard but granularity requirements vary."

3. Do you have role-based access control requirements?
   - Type: Yes/No with complexity (Simple roles → Complex matrix)
   - Helper: "Access control complexity affects implementation and ongoing maintenance."

4. Are you considering anti-money laundering (AML) or transaction monitoring tools?
   - Type: Yes/No with status (Considering, Planning, Required)
   - Helper: "AML tools may require specific integrations or data exports."

5. Do you need segregation of duties controls?
   - Type: Yes/No with examples
   - Helper: "Segregation of duties is important for financial controls and affects user role design."

6. How often do you undergo external audits?
   - Type: Multiple choice (Annual, Quarterly, Ad-hoc, Not applicable)
   - Helper: "Audit frequency affects reporting and data retention requirements."

---

## Section 9: Growth, Scalability & Strategy
**Estimated time: 5-6 minutes**

**Purpose:** Understand future growth plans and scalability needs. This helps assess long-term platform fit.

### Questions:
1. Do you plan to add new entities, locations, or business units in the next 3-5 years?
   - Type: Yes/No with details (free text)
   - Helper: "Growth plans affect scalability requirements and may favour more flexible platforms."

2. Do you anticipate significant transaction volume growth?
   - Type: Yes/No with scale (Moderate growth → Rapid expansion)
   - Helper: "Volume growth affects system performance requirements and cloud scalability."

3. What is your implementation timeline preference?
   - Type: Multiple choice (6 months, 12 months, 18-24 months, Flexible)
   - Helper: "Timeline affects phasing and may influence platform selection based on implementation complexity."

4. Are you open to adopting ERP best practices vs replicating current processes?
   - Type: Scale 1-5 (Replicate current → Adopt best practices)
   - Helper: "Process flexibility affects customisation needs and implementation cost."

5. Do you need the system to support future acquisitions or mergers?
   - Type: Yes/No
   - Helper: "M&A activity requires flexible multi-entity architecture."

6. What is your priority for the ERP implementation?
   - Type: Multiple select ranked (Cost efficiency, Speed to value, Functionality fit, Scalability, Integration capability, Partner support)
   - Helper: "Priorities help weight decision criteria and may influence platform selection."

---

## Section 10: Decision Criteria & Priorities
**Estimated time: 4-5 minutes**

**Purpose:** Capture explicit decision criteria weightings to support a balanced, defensible comparison.

### Questions:
1. When do you need to make a final ERP decision?
   - Type: Date picker
   - Helper: "Decision timeline affects discovery depth and implementation planning."

2. What is your target go-live date for Phase 1?
   - Type: Date picker (optional)
   - Helper: "Go-live target helps plan implementation phasing."

3. Please rank the importance of each decision criterion (total must equal 100%):
   - Type: Sliders or percentage inputs for each:
     - Price/Total Cost of Ownership (%)
     - Functionality fit (%)
     - Upgradeability/Scalability (%)
     - Integration friendliness (%)
     - Partner capability (%)
     - Implementation timeline (%)
   - Helper: "These weightings help create a balanced, objective comparison between platforms."

4. Are there any deal-breakers or must-have requirements?
   - Type: Free text
   - Helper: "Deal-breakers help filter platform options early in the evaluation."

5. Who are the key decision-makers for this ERP selection?
   - Type: Free text with roles
   - Helper: "Understanding decision-makers helps plan stakeholder engagement."

---

## Notes on Question Design

- **Plain English:** All questions avoid technical jargon
- **Helper Text:** Each question explains why it matters in business terms
- **Signal Capture:** Questions naturally surface:
  - Multi-entity complexity → Favours NetSuite
  - High integration volume → Favours NetSuite
  - Real-time requirements → Favours NetSuite
  - Simple, single-entity needs → Favours Business Central
  - Microsoft ecosystem preference → Favours Business Central
  - Configuration vs customisation tolerance → Affects both platforms
- **No Platform Bias:** Questions don't explicitly recommend a platform
- **Discovery Focus:** Questions gather context, not final design decisions
