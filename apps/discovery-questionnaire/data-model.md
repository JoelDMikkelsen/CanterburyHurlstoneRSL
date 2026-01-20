# Data Model Specification

## Response Storage Schema

### Azure Table Storage / Cosmos DB Document Structure

```json
{
  "id": "user-email-or-id",
  "partitionKey": "responses",
  "rowKey": "user-email-or-id",
  "timestamp": "2024-01-15T10:30:00Z",
  "lastUpdated": "2024-01-15T11:45:00Z",
  "startedAt": "2024-01-15T10:30:00Z",
  "completedAt": null,
  "progress": {
    "totalSections": 10,
    "completedSections": 3,
    "percentComplete": 30,
    "currentSection": 4
  },
  "sections": {
    "section1": {
      "id": "section1",
      "name": "Organisation & Entity Structure",
      "completed": true,
      "completedAt": "2024-01-15T10:45:00Z",
      "answers": {
        "q1": "3-5",
        "q2": true,
        "q2_followup": "4",
        "q3": true,
        "q3_count": "3",
        "q4": "Multiple entities under one parent",
        "q5": true,
        "q5_examples": "Shared IT, Finance, HR"
      }
    },
    "section2": {
      "id": "section2",
      "name": "Finance & Accounting Complexity",
      "completed": true,
      "completedAt": "2024-01-15T11:15:00Z",
      "answers": {
        "q1": "Segmented COA",
        "q2": "Adept",
        "q3": "3-5 years",
        "q4": true,
        "q4_currencies": ["AUD", "USD"],
        "q5": "Monthly",
        "q6": 3,
        "q7": "500-2000"
      }
    },
    "section3": {
      "id": "section3",
      "name": "Operations (Hospitality, Gaming, POS)",
      "completed": true,
      "completedAt": "2024-01-15T11:30:00Z",
      "answers": {
        "q1": 3,
        "q1_locations": ["Canterbury", "Croydon Park", "Wollongong"],
        "q2": ["SwiftPOS"],
        "q2_keep": true,
        "q3": true,
        "q3_system": "IGT Gaming",
        "q4": 150,
        "q5": true,
        "q5_system": "Cooking the Books",
        "q6": "Part of POS",
        "q7": "Daily",
        "q8": true,
        "q8_scale": 4
      }
    },
    "section4": {
      "id": "section4",
      "name": "Procure to Pay & Expenses",
      "completed": false,
      "completedAt": null,
      "answers": {}
    }
    // ... remaining sections
  },
  "metadata": {
    "userEmail": "user@clientdomain.com",
    "userName": "John Doe",
    "browser": "Chrome",
    "device": "desktop",
    "timeSpent": 1800
  }
}
```

## Section Completion Tracking

### Completion Rules
- A section is considered "completed" when:
  - All required questions are answered
  - User clicks "Mark as Complete" or proceeds to next section
- Progress is calculated as: `(completedSections / totalSections) * 100`
- Auto-save occurs on every field change

### Section State
```typescript
interface SectionState {
  id: string;
  name: string;
  completed: boolean;
  completedAt: string | null;
  answers: Record<string, any>;
  lastModified: string;
}
```

## Question Types

### Multiple Choice
```typescript
{
  type: "multiple-choice",
  options: string[],
  value: string | null
}
```

### Multiple Select
```typescript
{
  type: "multiple-select",
  options: string[],
  value: string[]
}
```

### Yes/No with Follow-up
```typescript
{
  type: "yes-no-followup",
  value: boolean | null,
  followupValue: any
}
```

### Scale (1-5)
```typescript
{
  type: "scale",
  min: number,
  max: number,
  labels: string[],
  value: number | null
}
```

### Number Input
```typescript
{
  type: "number",
  min?: number,
  max?: number,
  value: number | null
}
```

### Free Text
```typescript
{
  type: "text",
  maxLength?: number,
  value: string
}
```

### Date Picker
```typescript
{
  type: "date",
  value: string | null // ISO date string
}
```

### Percentage Sliders (for Section 10)
```typescript
{
  type: "percentage-sliders",
  criteria: {
    price: number, // 0-100, must sum to 100
    functionality: number,
    scalability: number,
    integration: number,
    partner: number,
    timeline: number
  }
}
```

## Auto-save Strategy

- Save on every field blur/change
- Debounce: 500ms delay before actual save
- Show save indicator: "Saving..." → "Saved"
- Handle offline: Queue saves, sync when online
- Error handling: Retry with exponential backoff

## Data Persistence Implementation

### Azure Table Storage (Recommended for simplicity)
- Partition Key: "responses"
- Row Key: User email/ID
- Store entire response object as JSON in a single property
- Benefits: Simple, cost-effective, sufficient for this use case

### Cosmos DB (Alternative)
- Partition Key: User email/ID
- Document structure as shown above
- Benefits: Better querying, more scalable, but more complex

### API Endpoints Needed
- `GET /api/responses` - Get user's current responses
- `POST /api/responses` - Save/update responses
- `GET /api/responses/progress` - Get progress summary
- `POST /api/responses/complete` - Mark questionnaire as complete
