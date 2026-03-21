/**
 * Runtime Environment Configuration
 * 
 * This file centralizes access to environment variables.
 * In production (Docker via Nginx), these variables are injected at runtime into window.__ENV__.
 * In development, we fall back to Vite's import.meta.env.
 */

declare global {
  interface Window {
    __ENV__: Record<string, string>;
  }
}

export const env = {
  get VITE_API_BASE_URL() {
    return window.__ENV__?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL;
  },
  get VITE_JANUS_WS_URL() {
    return window.__ENV__?.VITE_JANUS_WS_URL || import.meta.env.VITE_JANUS_WS_URL;
  },
  get VITE_NODE_SERVER_URL() {
    return window.__ENV__?.VITE_NODE_SERVER_URL || import.meta.env.VITE_NODE_SERVER_URL;
  },
  get VITE_MINIO_URL() {
    return window.__ENV__?.VITE_MINIO_URL || import.meta.env.VITE_MINIO_URL;
  },
};
