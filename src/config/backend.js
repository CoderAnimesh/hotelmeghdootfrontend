/**
 * Frontend Configuration & Client Connector for Express Backend APIs
 * - Development: Vite proxies /api/* → http://localhost:3001 (BACKEND_URL = "")
 * - Production (Vercel): /api/* is served by the same-domain serverless function (BACKEND_URL = "")
 * - Override: set VITE_BACKEND_URL env var if using a separate backend domain
 */

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

/**
 * Retrieve or generate a persistent device fingerprint token unique to this browser instance
 */
export const getClientFingerprint = () => {
  let fingerprint = localStorage.getItem("meghdoot_client_fingerprint");
  if (!fingerprint) {
    fingerprint = "fp_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("meghdoot_client_fingerprint", fingerprint);
  }
  return fingerprint;
};

/**
 * Global API dispatcher with automatic 3-Token injection
 * @param {string} endpoint - API path (e.g. '/api/bookings/create')
 * @param {string} method - HTTP method ('GET', 'POST', etc.)
 * @param {object} [body] - Optional request body
 * @param {string} [operationToken] - 3rd Token: Dynamic OTP code (required for highly protected routes)
 */
export const requestBackend = async (endpoint, method = "GET", body = null, operationToken = null) => {
  const token = localStorage.getItem("meghdoot_jwt");
  const fingerprint = getClientFingerprint();

  const headers = {
    "Content-Type": "application/json",
    "x-client-fingerprint": fingerprint
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (operationToken) {
    headers["x-operation-token"] = operationToken;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || `HTTP error! Status: ${response.status}`);
  }

  return result;
};
