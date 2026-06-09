import { AnimatePresence, motion } from "framer-motion";
import { Activity, FileCheck2, FileText, Pencil, Plus, ShieldAlert, Trash2, UserRoundCog, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell.jsx";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import MetricCard from "../components/MetricCard.jsx";
import Page from "../components/Page.jsx";
import Select from "../components/Select.jsx";
import { SkeletonCard, SkeletonLine } from "../components/Skeleton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  createEmployee,
  deleteEmployee,
  getAdminAnalytics,
  getAdminDocuments,
  getAuditLogs,
  getEmployees,
  updateEmployee,
} from "../lib/api.js";
import { stagger } from "../lib/motion.js";

const tabs = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "users", label: "Users", icon: Users },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "audit", label: "Audit", icon: ShieldAlert },
];

const emptyEmployee = {
  full_name: "",
  username: "",
  password: "",
  role: "employee",
};

export default function AdminDashboard() {
  const { token, username } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [state, setState] = useState({ loading: true, analytics: null, documents: [], logs: [], employees: [] });
  const [employeeForm, setEmployeeForm] = useState(emptyEmployee);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const currentEmployee = useMemo(
    () => state.employees.find((employee) => employee.username === username),
    [state.employees, username],
  );

  async function loadData() {
    const [analytics, documents, logs, employees] = await Promise.all([
      getAdminAnalytics(token),
      getAdminDocuments(token),
      getAuditLogs(token),
      getEmployees(token),
    ]);
    setState({ loading: false, analytics, documents, logs, employees });
  }

  useEffect(() => {
    let active = true;
    loadData()
      .catch((err) => {
        if (active) {
          setError(err.message);
          setState((current) => ({ ...current, loading: false }));
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  function resetEmployeeForm() {
    setEmployeeForm(emptyEmployee);
    setEditingId(null);
  }

  function startEdit(employee) {
    setEditingId(employee.id);
    setEmployeeForm({
      full_name: employee.full_name,
      username: employee.username,
      password: "",
      role: employee.role,
    });
    setActiveTab("users");
  }

  async function handleEmployeeSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);

    try {
      if (editingId) {
        const payload = { ...employeeForm };
        if (!payload.password) delete payload.password;
        await updateEmployee({ token, id: editingId, employee: payload });
        setNotice("Employee updated.");
      } else {
        await createEmployee({ token, employee: employeeForm });
        setNotice("Employee created with a system-generated ID.");
      }
      resetEmployeeForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleEmployee(employee) {
    setError("");
    setNotice("");
    try {
      await updateEmployee({ token, id: employee.id, employee: { is_active: !employee.is_active } });
      setNotice(employee.is_active ? "Employee disabled." : "Employee enabled.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeEmployee(employee) {
    setError("");
    setNotice("");
    try {
      await deleteEmployee({ token, id: employee.id });
      setNotice("Employee deleted.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Page>
      <AppShell eyebrow="Administration" title="Command center" subtitle="Manage employees, documents, verification analytics, and audit activity.">
        {error ? <Alert tone="danger" message={error} /> : null}
        {notice ? <Alert tone="success" message={notice} /> : null}

        {state.loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <motion.div variants={stagger} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Documents uploaded" value={state.analytics?.documents_uploaded} icon={FileText} tone="dark" />
            <MetricCard label="Verified scans" value={state.analytics?.documents_verified} icon={FileCheck2} tone="green" />
            <MetricCard label="Failed attempts" value={state.analytics?.failed_verification_attempts} icon={ShieldAlert} tone="light" />
            <MetricCard label="Today" value={state.analytics?.todays_verifications} icon={Activity} tone="light" />
          </motion.div>
        )}

        <div className="mt-6 flex gap-2 overflow-x-auto rounded-3xl border border-ink-950/10 bg-white/70 p-2 shadow-sm backdrop-blur">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition ${
                activeTab === tab.id ? "bg-ink-950 text-white shadow-lift" : "text-ink-700 hover:bg-ink-950/[0.04]"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24 }}
            className="mt-6"
          >
            {activeTab === "overview" ? <Overview documents={state.documents} logs={state.logs} loading={state.loading} /> : null}
            {activeTab === "users" ? (
              <UsersPanel
                currentEmployee={currentEmployee}
                editingId={editingId}
                employeeForm={employeeForm}
                employees={state.employees}
                loading={state.loading}
                onCancel={resetEmployeeForm}
                onChange={setEmployeeForm}
                onDelete={removeEmployee}
                onEdit={startEdit}
                onSubmit={handleEmployeeSubmit}
                onToggle={toggleEmployee}
                saving={saving}
              />
            ) : null}
            {activeTab === "documents" ? <DocumentsPanel documents={state.documents} loading={state.loading} /> : null}
            {activeTab === "audit" ? <AuditPanel logs={state.logs} loading={state.loading} /> : null}
          </motion.div>
        </AnimatePresence>
      </AppShell>
    </Page>
  );
}

function Overview({ documents, logs, loading }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Panel title="Recent documents">{loading ? <LoadingRows /> : <DocumentList documents={documents.slice(0, 5)} />}</Panel>
      <Panel title="Recent audit activity">{loading ? <LoadingRows /> : <AuditList logs={logs.slice(0, 6)} />}</Panel>
    </div>
  );
}

function UsersPanel({
  currentEmployee,
  editingId,
  employeeForm,
  employees,
  loading,
  onCancel,
  onChange,
  onDelete,
  onEdit,
  onSubmit,
  onToggle,
  saving,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
      <Panel title={editingId ? "Edit employee" : "Create employee"}>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Full name"
            value={employeeForm.full_name}
            onChange={(event) => onChange({ ...employeeForm, full_name: event.target.value })}
            required
          />
          <div className="rounded-3xl border border-ink-950/10 bg-ivory p-4">
            <p className="text-sm font-semibold text-ink-950">
              {editingId ? "Employee ID is system-managed" : "Employee ID will be generated automatically"}
            </p>
            <p className="mt-1 text-xs leading-5 text-ink-700/60">
              VeriDoc uses one format for every account: UBC-EMP-000001, UBC-EMP-000002, and so on.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Username"
              value={employeeForm.username}
              onChange={(event) => onChange({ ...employeeForm, username: event.target.value })}
              required
            />
            <Select label="Role" value={employeeForm.role} onChange={(event) => onChange({ ...employeeForm, role: event.target.value })}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          <Input
            label={editingId ? "New password" : "Password"}
            type="password"
            value={employeeForm.password}
            onChange={(event) => onChange({ ...employeeForm, password: event.target.value })}
            required={!editingId}
            hint={editingId ? "Leave blank to keep current password" : ""}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" icon={editingId ? Pencil : Plus} loading={saving}>
              {editingId ? "Save changes" : "Create employee"}
            </Button>
            {editingId ? (
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </Panel>

      <Panel title="User management">
        {loading ? (
          <LoadingRows />
        ) : (
          <div className="grid gap-3">
            {employees.map((employee) => (
              <EmployeeRow
                currentEmployee={currentEmployee}
                employee={employee}
                key={employee.id}
                onDelete={onDelete}
                onEdit={onEdit}
                onToggle={onToggle}
              />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function EmployeeRow({ currentEmployee, employee, onDelete, onEdit, onToggle }) {
  const isSelf = currentEmployee?.id === employee.id;

  return (
    <div className="rounded-3xl border border-ink-950/10 bg-ivory p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-ink-950">{employee.full_name}</p>
            {isSelf ? <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink-700">You</span> : null}
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${employee.is_active ? "bg-bank-50 text-bank-700" : "bg-red-50 text-red-700"}`}>
              {employee.is_active ? "Active" : "Disabled"}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-700/60">
            {employee.username} / {employee.employee_id} / {employee.role}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={Pencil} className="h-10 px-4" onClick={() => onEdit(employee)}>
            Edit
          </Button>
          <Button variant="secondary" className="h-10 px-4" disabled={isSelf} onClick={() => onToggle(employee)}>
            {employee.is_active ? "Disable" : "Enable"}
          </Button>
          <Button variant="subtle" icon={Trash2} className="h-10 px-4 text-red-700 hover:bg-red-50" disabled={isSelf} onClick={() => onDelete(employee)}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function DocumentsPanel({ documents, loading }) {
  return <Panel title="Document management dashboard">{loading ? <LoadingRows /> : <DocumentList documents={documents} />}</Panel>;
}

function AuditPanel({ logs, loading }) {
  return <Panel title="Audit dashboard">{loading ? <LoadingRows /> : <AuditList logs={logs} />}</Panel>;
}

function Panel({ title, children, className = "" }) {
  return (
    <section className={`rounded-[2rem] border border-ink-950/10 bg-white/72 p-5 shadow-sm backdrop-blur ${className}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-ink-950 text-white">
          <UserRoundCog className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-semibold text-ink-950">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function DocumentList({ documents }) {
  if (!documents.length) return <Empty label="No documents generated yet." />;

  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <div key={document.id} className="rounded-3xl border border-ink-950/10 bg-ivory p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-ink-950">{document.document_type}</p>
              <p className="mt-1 text-sm text-ink-700/60">{document.customer_name}</p>
            </div>
            <span className="rounded-full bg-bank-50 px-3 py-1 text-xs font-semibold text-bank-700">
              {document.is_valid ? "Valid" : "Invalid"}
            </span>
          </div>
          <div className="mt-3 grid gap-2 text-xs text-ink-700/50 md:grid-cols-2">
            <p className="break-all">{document.document_id}</p>
            <p className="md:text-right">{new Date(document.date_uploaded).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AuditList({ logs }) {
  if (!logs.length) return <Empty label="No audit logs yet." />;

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="flex flex-col gap-3 rounded-2xl bg-ivory px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold capitalize text-ink-950">{log.event_type.replaceAll("_", " ")}</p>
            <p className="mt-1 text-xs text-ink-700/55">{log.message || "Recorded event"}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-700">{log.status}</span>
            <span className="text-xs text-ink-700/45">{new Date(log.timestamp).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-4">
      <SkeletonLine className="h-14 w-full rounded-3xl" />
      <SkeletonLine className="h-14 w-full rounded-3xl" />
      <SkeletonLine className="h-14 w-full rounded-3xl" />
    </div>
  );
}

function Empty({ label }) {
  return <div className="rounded-3xl border border-dashed border-ink-950/12 bg-ivory p-8 text-center text-sm text-ink-700/55">{label}</div>;
}

function Alert({ message, tone }) {
  const classes = tone === "success" ? "bg-bank-50 text-bank-700" : "bg-red-50 text-red-700";
  return <p className={`mb-5 rounded-2xl px-4 py-3 text-sm font-medium ${classes}`}>{message}</p>;
}
