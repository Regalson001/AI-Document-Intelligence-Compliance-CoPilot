
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export interface DocumentRecord {
  id: number;
  filename: string;
  category: string;
  status: string;
  compliance_status: string;
  extracted_fields: Record<string, unknown>;
  issues: string[];
  created_at: string;
}

export interface Analytics {
  total_documents: number;
  processed_documents: number;
  flagged_documents: number;
  categories: {
    name: string;
    value: number;
  }[];
  monthly_activity: {
    month: string;
    documents: number;
  }[];
  compliance: {
    name: string;
    value: number;
  }[];
}

export interface ChatResponse {
  answer: string;
  source_documents: string[];
  ai_enabled: boolean;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const errorData = await response.json();
      message = errorData.detail || errorData.message || message;
    } catch {
      // Keep the default error message if the response is not JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getDocuments(): Promise<DocumentRecord[]> {
    return request<DocumentRecord[]>("/api/documents");
  },

  getDocument(id: number): Promise<DocumentRecord> {
    return request<DocumentRecord>(`/api/documents/${id}`);
  },

  getAnalytics(): Promise<Analytics> {
    return request<Analytics>("/api/analytics");
  },

  uploadDocument(file: File): Promise<DocumentRecord> {
    const formData = new FormData();
    formData.append("file", file);

    return request<DocumentRecord>("/api/documents/upload", {
      method: "POST",
      body: formData,
    });
  },

  deleteDocument(id: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/documents/${id}`, {
      method: "DELETE",
    });
  },

  askQuestion(question: string): Promise<ChatResponse> {
    return request<ChatResponse>("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });
  },

  async exportCSV(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/export/csv`);

    if (!response.ok) {
      throw new Error("Could not export the document report.");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "documind-compliance-report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  },
};
