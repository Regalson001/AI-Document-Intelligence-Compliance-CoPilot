
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  Bot,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileSearch,
  FileText,
  Files,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
  Menu,
  RefreshCw,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  api,
  type Analytics,
  type DocumentRecord,
} from "./services/api";

type Page =
  | "dashboard"
  | "documents"
  | "compliance"
  | "assistant";

const emptyAnalytics: Analytics = {
  total_documents: 0,
  processed_documents: 0,
  flagged_documents: 0,
  categories: [],
  monthly_activity: [],
  compliance: [],
};

const chartColors = [
  "#7c5cff",
  "#20c997",
  "#f5a623",
  "#ef5b72",
  "#39a9db",
];

function formatDate(value: string): string {
  if (!value) return "Unknown date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusClass(status: string): string {
  const value = status.toLowerCase();

  if (value.includes("compliant") || value.includes("approved")) {
    return "status status-success";
  }

  if (value.includes("flagged") || value.includes("non-compliant")) {
    return "status status-danger";
  }

  if (value.includes("pending") || value.includes("review")) {
    return "status status-warning";
  }

  return "status";
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [analytics, setAnalytics] =
    useState<Analytics>(emptyAnalytics);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "Hello! I'm DocuMind AI. Upload documents and ask me questions about your document collection.",
    },
  ]);

  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [documentData, analyticsData] = await Promise.all([
        api.getDocuments(),
        api.getAnalytics(),
      ]);

      setDocuments(documentData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the backend.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setUploading(true);
    setError("");

    try {
      for (const file of files) {
        await api.uploadDocument(file);
      }

      await loadData();
      setPage("documents");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Document upload failed.",
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?",
    );

    if (!confirmed) return;

    try {
      await api.deleteDocument(id);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete document.",
      );
    }
  }

  async function handleExport() {
    try {
      await api.exportCSV();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Report export failed.",
      );
    }
  }

  async function handleAskQuestion(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || chatLoading) return;

    setMessages((current) => [
      ...current,
      { role: "user", content: trimmedQuestion },
    ]);

    setQuestion("");
    setChatLoading(true);

    try {
      const response = await api.askQuestion(trimmedQuestion);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.answer,
        },
      ]);
    } catch (err) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            err instanceof Error
              ? err.message
              : "I couldn't process that question.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  const filteredDocuments = documents.filter((document) => {
    const query = searchTerm.toLowerCase();

    return (
      document.filename.toLowerCase().includes(query) ||
      document.category.toLowerCase().includes(query) ||
      document.compliance_status.toLowerCase().includes(query)
    );
  });

  const flaggedDocuments = documents.filter(
    (document) =>
      document.compliance_status.toLowerCase() !== "compliant",
  );

  const navigation = [
    {
      id: "dashboard" as Page,
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "documents" as Page,
      label: "Documents",
      icon: Files,
    },
    {
      id: "compliance" as Page,
      label: "Compliance",
      icon: ShieldCheck,
    },
    {
      id: "assistant" as Page,
      label: "AI Assistant",
      icon: Bot,
    },
  ];

  function navigate(nextPage: Page) {
    setPage(nextPage);
    setMobileMenuOpen(false);
  }

  return (
    <div className="app-shell">
      {mobileMenuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}
      >
        <div className="brand">
          <div className="brand-icon">
            <FileCheck2 size={23} />
          </div>

          <div>
            <h1>DocuMind<span> AI</span></h1>
            <p>INTELLIGENCE PLATFORM</p>
          </div>

          <button
            className="mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`nav-item ${
                  page === item.id ? "nav-active" : ""
                }`}
                onClick={() => navigate(item.id)}
              >
                <Icon size={19} />
                <span>{item.label}</span>

                {item.id === "documents" && (
                  <span className="nav-count">
                    {documents.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <div className="online-dot" />
            <span>Workspace active</span>
          </div>

          <div className="profile">
            <div className="avatar">DM</div>
            <div>
              <strong>DocuMind Workspace</strong>
              <small>Administrator</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            <div>
              <div className="breadcrumb">
                Workspace <span>/</span>{" "}
                {navigation.find((item) => item.id === page)?.label}
              </div>
              <h2>
                {page === "dashboard" && "Overview"}
                {page === "documents" && "Document repository"}
                {page === "compliance" && "Compliance monitoring"}
                {page === "assistant" && "AI Assistant"}
              </h2>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button"
              onClick={() => void loadData()}
              title="Refresh data"
            >
              <RefreshCw size={18} />
            </button>

            <button
              className="primary-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="spin" size={17} />
              ) : (
                <Plus size={18} />
              )}
              <span>Upload document</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              multiple
              hidden
              onChange={handleUpload}
            />
          </div>
        </header>

        <div className="page-content">
          {error && (
            <div className="error-banner">
              <AlertTriangle size={18} />
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <Loader2 size={30} className="spin" />
              <p>Loading your workspace...</p>
            </div>
          ) : (
            <>
              {page === "dashboard" && (
                <Dashboard
                  analytics={analytics}
                  documents={documents}
                  onNavigate={navigate}
                  onExport={handleExport}
                />
              )}

              {page === "documents" && (
                <DocumentsPage
                  documents={filteredDocuments}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onDelete={handleDelete}
                  onUpload={() => fileInputRef.current?.click()}
                />
              )}

              {page === "compliance" && (
                <CompliancePage
                  documents={documents}
                  flaggedDocuments={flaggedDocuments}
                  onNavigate={navigate}
                />
              )}

              {page === "assistant" && (
                <AssistantPage
                  messages={messages}
                  question={question}
                  setQuestion={setQuestion}
                  loading={chatLoading}
                  onSubmit={handleAskQuestion}
                  chatEndRef={chatEndRef}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Dashboard({
  analytics,
  documents,
  onNavigate,
  onExport,
}: {
  analytics: Analytics;
  documents: DocumentRecord[];
  onNavigate: (page: Page) => void;
  onExport: () => void;
}) {
  const recentDocuments = documents.slice(0, 5);

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <Sparkles size={15} /> INTELLIGENT DOCUMENT OPERATIONS
          </div>
          <h1>Your documents, understood.</h1>
          <p>
            Monitor document activity, extract information and
            identify compliance issues from one workspace.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={onExport}
        >
          <ArrowDownToLine size={17} />
          Export report
        </button>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Total documents"
          value={analytics.total_documents}
          icon={<Files size={20} />}
          detail="Documents in your workspace"
          tone="purple"
        />

        <StatCard
          label="Processed documents"
          value={analytics.processed_documents}
          icon={<CheckCircle2 size={20} />}
          detail="Successfully processed"
          tone="green"
        />

        <StatCard
          label="Flagged documents"
          value={analytics.flagged_documents}
          icon={<AlertTriangle size={20} />}
          detail="Require further review"
          tone="orange"
        />

        <StatCard
          label="Document categories"
          value={analytics.categories.length}
          icon={<FileSearch size={20} />}
          detail="Identified document types"
          tone="blue"
        />
      </section>

      <section className="dashboard-grid">
        <div className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h3>Document activity</h3>
              <p>Monthly document processing activity</p>
            </div>
            <span className="panel-icon">
              <Activity size={18} />
            </span>
          </div>

          {analytics.monthly_activity.length ? (
            <div className="chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthly_activity}>
                  <defs>
                    <linearGradient
                      id="activityGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#8667ff"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="#8667ff"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#25283a"
                  />

                  <XAxis
                    dataKey="month"
                    stroke="#777b91"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    stroke="#777b91"
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#171a28",
                      border: "1px solid #303349",
                      borderRadius: 10,
                      color: "#fff",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="documents"
                    stroke="#8667ff"
                    strokeWidth={3}
                    fill="url(#activityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={<Activity size={23} />}
              title="No activity yet"
              description="Upload documents to start building your activity history."
            />
          )}
        </div>

        <div className="panel category-panel">
          <div className="panel-heading">
            <div>
              <h3>Document categories</h3>
              <p>Distribution by document type</p>
            </div>
          </div>

          {analytics.categories.length ? (
            <>
              <div className="pie-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categories}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={4}
                    >
                      {analytics.categories.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="legend-list">
                {analytics.categories.map((item, index) => (
                  <div className="legend-item" key={item.name}>
                    <span
                      className="legend-dot"
                      style={{
                        background:
                          chartColors[index % chartColors.length],
                      }}
                    />
                    <span>{item.name}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={<Files size={23} />}
              title="No categories yet"
              description="Your document categories will appear here."
            />
          )}
        </div>
      </section>

      <section className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <h3>Recent documents</h3>
            <p>Your latest uploaded documents</p>
          </div>

          <button
            className="text-button"
            onClick={() => onNavigate("documents")}
          >
            View all
          </button>
        </div>

        <DocumentTable documents={recentDocuments} />
      </section>
    </>
  );
}

function StatCard({
  label,
  value,
  icon,
  detail,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  detail: string;
  tone: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <div className={`stat-icon ${tone}`}>{icon}</div>
      </div>
      <strong className="stat-value">{value}</strong>
      <p>{detail}</p>
    </div>
  );
}

function DocumentsPage({
  documents,
  searchTerm,
  setSearchTerm,
  onDelete,
  onUpload,
}: {
  documents: DocumentRecord[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onDelete: (id: number) => void;
  onUpload: () => void;
}) {
  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="eyebrow">DOCUMENT MANAGEMENT</div>
          <h1>Document repository</h1>
          <p>
            Search, organize and manage your processed documents.
          </p>
        </div>

        <button className="primary-button" onClick={onUpload}>
          <UploadCloud size={17} /> Upload files
        </button>
      </section>

      <section className="panel">
        <div className="repository-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search documents..."
            />
          </div>

          <span className="result-count">
            {documents.length} documents
          </span>
        </div>

        <DocumentTable
          documents={documents}
          onDelete={onDelete}
          showActions
        />
      </section>
    </>
  );
}

function DocumentTable({
  documents,
  onDelete,
  showActions = false,
}: {
  documents: DocumentRecord[];
  onDelete?: (id: number) => void;
  showActions?: boolean;
}) {
  if (!documents.length) {
    return (
      <EmptyState
        icon={<FileText size={23} />}
        title="No documents found"
        description="Upload a PDF, image or text file to get started."
      />
    );
  }

  return (
    <div className="table-scroll">
      <table className="document-table">
        <thead>
          <tr>
            <th>DOCUMENT</th>
            <th>CATEGORY</th>
            <th>PROCESSING</th>
            <th>COMPLIANCE</th>
            <th>DATE ADDED</th>
            {showActions && <th>ACTIONS</th>}
          </tr>
        </thead>

        <tbody>
          {documents.map((document) => (
            <tr key={document.id}>
              <td>
                <div className="document-name">
                  <span className="file-icon">
                    <FileText size={18} />
                  </span>
                  <span>{document.filename}</span>
                </div>
              </td>

              <td>{document.category}</td>

              <td>
                <span className={statusClass(document.status)}>
                  {document.status}
                </span>
              </td>

              <td>
                <span
                  className={statusClass(
                    document.compliance_status,
                  )}
                >
                  {document.compliance_status}
                </span>
              </td>

              <td>{formatDate(document.created_at)}</td>

              {showActions && (
                <td>
                  <button
                    className="delete-button"
                    onClick={() => onDelete?.(document.id)}
                    title="Delete document"
                    aria-label={`Delete ${document.filename}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompliancePage({
  documents,
  flaggedDocuments,
  onNavigate,
}: {
  documents: DocumentRecord[];
  flaggedDocuments: DocumentRecord[];
  onNavigate: (page: Page) => void;
}) {
  const compliantCount =
    documents.length - flaggedDocuments.length;

  const complianceRate = documents.length
    ? Math.round((compliantCount / documents.length) * 100)
    : 0;

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="eyebrow">RISK AND POLICY MONITORING</div>
          <h1>Compliance monitoring</h1>
          <p>
            Review document checks and identify records that may
            need attention.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Documents reviewed"
          value={documents.length}
          icon={<FileCheck2 size={20} />}
          detail="Documents in this workspace"
          tone="purple"
        />

        <StatCard
          label="Compliant"
          value={compliantCount}
          icon={<CheckCircle2 size={20} />}
          detail="No detected compliance flags"
          tone="green"
        />

        <StatCard
          label="Flagged"
          value={flaggedDocuments.length}
          icon={<AlertTriangle size={20} />}
          detail="Documents requiring review"
          tone="orange"
        />

        <StatCard
          label="Compliance rate"
          value={complianceRate}
          icon={<ShieldCheck size={20} />}
          detail="Percentage of unflagged documents"
          tone="blue"
        />
      </section>

      <section className="panel compliance-panel">
        <div className="panel-heading">
          <div>
            <h3>Documents requiring attention</h3>
            <p>
              Review the detected issues before making compliance
              decisions.
            </p>
          </div>
        </div>

        {flaggedDocuments.length ? (
          <div className="issue-list">
            {flaggedDocuments.map((document) => (
              <div className="issue-card" key={document.id}>
                <div className="issue-icon">
                  <AlertTriangle size={20} />
                </div>

                <div className="issue-content">
                  <strong>{document.filename}</strong>
                  <p>
                    {document.issues.length
                      ? document.issues.join(", ")
                      : "This document has been flagged for review."}
                  </p>
                  <small>
                    {document.category} ·{" "}
                    {formatDate(document.created_at)}
                  </small>
                </div>

                <span
                  className={statusClass(
                    document.compliance_status,
                  )}
                >
                  {document.compliance_status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ShieldCheck size={23} />}
            title="No flagged documents"
            description="There are no detected compliance flags in your current document collection."
          />
        )}

        <button
          className="secondary-button compliance-action"
          onClick={() => onNavigate("documents")}
        >
          <Files size={17} /> Open document repository
        </button>
      </section>
    </>
  );
}

function AssistantPage({
  messages,
  question,
  setQuestion,
  loading,
  onSubmit,
  chatEndRef,
}: {
  messages: { role: "user" | "assistant"; content: string }[];
  question: string;
  setQuestion: (value: string) => void;
  loading: boolean;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
  ) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <Sparkles size={15} /> INTELLIGENT DOCUMENT ASSISTANCE
          </div>
          <h1>Ask your documents.</h1>
          <p>
            Ask questions about your uploaded document collection.
          </p>
        </div>
      </section>

      <section className="assistant-layout">
        <div className="panel chat-panel">
          <div className="chat-header">
            <div className="assistant-avatar">
              <Bot size={22} />
            </div>
            <div>
              <strong>DocuMind Assistant</strong>
              <small>
                <span className="online-dot" /> Ready to help
              </small>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message-row ${
                  message.role === "user" ? "message-user" : ""
                }`}
              >
                {message.role === "assistant" && (
                  <div className="message-avatar">
                    <Bot size={17} />
                  </div>
                )}

                <div className="message-bubble">
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-row">
                <div className="message-avatar">
                  <Bot size={17} />
                </div>
                <div className="message-bubble typing">
                  <Loader2 size={16} className="spin" />
                  Thinking...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <form className="chat-form" onSubmit={onSubmit}>
            <input
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              placeholder="Ask a question about your documents..."
              disabled={loading}
            />

            <button
              type="submit"
              disabled={!question.trim() || loading}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

        <aside className="panel suggestions-panel">
          <div className="panel-heading">
            <div>
              <h3>Suggested questions</h3>
              <p>Ideas to get started</p>
            </div>
            <MessageSquare size={19} />
          </div>

          {[
            "How many documents are in my workspace?",
            "Which documents have compliance issues?",
            "Summarize the documents in my collection.",
            "What information is available in my invoices?",
          ].map((suggestion) => (
            <button
              className="suggestion"
              key={suggestion}
              onClick={() => setQuestion(suggestion)}
            >
              <span>{suggestion}</span>
              <Send size={15} />
            </button>
          ))}
        </aside>
      </section>
    </>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
