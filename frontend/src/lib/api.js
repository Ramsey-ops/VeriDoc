const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const API_V1 = `${API_BASE_URL}/api/v1`;

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === "object" ? data.detail || "Request failed" : data || "Request failed";
    throw new Error(message);
  }

  return data;
}

export async function loginEmployee(credentials) {
  const response = await fetch(`${API_V1}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return parseResponse(response);
}

export async function generateDocument({ token, formData }) {
  const response = await fetch(`${API_V1}/documents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return parseResponse(response);
}

export async function downloadGeneratedDocument({ token, path, filename }) {
  const response = await fetch(apiUrl(path), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : await response.text();
    const message = typeof data === "object" ? data.detail || "Unable to download document" : data || "Unable to download document";
    throw new Error(message);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "veridoc-document.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function verifyDocument(documentId) {
  const response = await fetch(`${API_V1}/verification/${documentId}`);
  return parseResponse(response);
}

export async function getAdminAnalytics(token) {
  const response = await fetch(`${API_V1}/admin/analytics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseResponse(response);
}

export async function getAdminDocuments(token) {
  const response = await fetch(`${API_V1}/admin/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseResponse(response);
}

export async function getAuditLogs(token) {
  const response = await fetch(`${API_V1}/admin/audit-logs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseResponse(response);
}

export async function getEmployees(token) {
  const response = await fetch(`${API_V1}/admin/employees`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseResponse(response);
}

export async function createEmployee({ token, employee }) {
  const response = await fetch(`${API_V1}/admin/employees`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(employee),
  });
  return parseResponse(response);
}

export async function updateEmployee({ token, id, employee }) {
  const response = await fetch(`${API_V1}/admin/employees/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(employee),
  });
  return parseResponse(response);
}

export async function deleteEmployee({ token, id }) {
  const response = await fetch(`${API_V1}/admin/employees/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 204) return null;
  return parseResponse(response);
}

export function apiUrl(path) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
}
