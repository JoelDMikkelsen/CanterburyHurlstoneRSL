import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";
import { QuestionnaireResponse, Progress, SectionState } from "@/types";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "";
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY || "";
const tableName = "questionnaireresponses";

let tableClient: TableClient | null = null;

async function getTableClient(): Promise<TableClient> {
  if (!tableClient) {
    if (!accountName || !accountKey) {
      throw new Error("Azure Storage credentials not configured");
    }
    const credential = new AzureNamedKeyCredential(accountName, accountKey);
    tableClient = new TableClient(
      `https://${accountName}.table.core.windows.net`,
      tableName,
      credential
    );
    
    // Ensure table exists (create if it doesn't)
    try {
      await tableClient.createTable();
    } catch (error: any) {
      // Table already exists, which is fine
      if (error.statusCode !== 409) {
        throw error;
      }
    }
  }
  return tableClient;
}

export async function getResponse(userId: string): Promise<QuestionnaireResponse | null> {
  try {
    const client = await getTableClient();
    const entity = await client.getEntity("responses", userId);
    return entity as unknown as QuestionnaireResponse;
  } catch (error: any) {
    if (error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

export async function saveResponse(response: QuestionnaireResponse): Promise<void> {
  const client = await getTableClient();
  const entity = {
    partitionKey: response.partitionKey,
    rowKey: response.rowKey,
    ...response,
  };
  await client.upsertEntity(entity, "Replace");
}

export async function createInitialResponse(
  userId: string,
  userEmail: string,
  userName: string
): Promise<QuestionnaireResponse> {
  const now = new Date().toISOString();
  const sections: { [key: string]: SectionState } = {};
  
  // Initialize all sections
  for (let i = 1; i <= 10; i++) {
    sections[`section${i}`] = {
      id: `section${i}`,
      name: "",
      completed: false,
      completedAt: null,
      answers: {},
      lastModified: now,
    };
  }

  const response: QuestionnaireResponse = {
    id: userId,
    partitionKey: "responses",
    rowKey: userId,
    timestamp: now,
    lastUpdated: now,
    startedAt: now,
    completedAt: null,
    progress: {
      totalSections: 10,
      completedSections: 0,
      percentComplete: 0,
      currentSection: 1,
    },
    sections,
    metadata: {
      userEmail,
      userName,
    },
  };

  await saveResponse(response);
  return response;
}

export function calculateProgress(sections: { [key: string]: SectionState }): Progress {
  const totalSections = Object.keys(sections).length;
  const completedSections = Object.values(sections).filter((s) => s.completed).length;
  const percentComplete = Math.round((completedSections / totalSections) * 100);
  
  // Find first incomplete section
  let currentSection = 1;
  for (let i = 1; i <= totalSections; i++) {
    if (!sections[`section${i}`]?.completed) {
      currentSection = i;
      break;
    }
  }

  return {
    totalSections,
    completedSections,
    percentComplete,
    currentSection,
  };
}
