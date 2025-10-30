// Appwrite SDK setup for Next.js (Server and Client)
// - Server: uses node-appwrite with API key; do not import into edge runtime
// - Client: uses appwrite without API key; call factories inside client components only

import { Client as WebClient, Account as WebAccount, Databases as WebDatabases, Storage as WebStorage, Avatars as WebAvatars, Functions as WebFunctions, ID, Query } from 'appwrite';

import type { Client as WebClientType } from 'appwrite';
type AnyClient = WebClientType | unknown;

interface AppwriteEnv {
  endpoint: string;
  projectId: string;
  apiKey?: string; // server-only
}

function readEnv(isServer: boolean): AppwriteEnv {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT || '';
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID || '';
  const apiKey = isServer ? process.env.APPWRITE_API_KEY : undefined;

  if (!endpoint) throw new Error('Appwrite endpoint is not configured. Set NEXT_PUBLIC_APPWRITE_ENDPOINT.');
  if (!projectId) throw new Error('Appwrite project ID is not configured. Set NEXT_PUBLIC_APPWRITE_PROJECT_ID.');

  return { endpoint, projectId, apiKey };
}

const isServerRuntime = typeof window === 'undefined';

declare global {
  // HMR-safe singletons in Next.js dev
  // eslint-disable-next-line no-var
  var __appwriteServerClient__: AnyClient | undefined;
  // eslint-disable-next-line no-var
  var __appwriteBrowserClient__: AnyClient | undefined;
}

function createClient(isServer: boolean): AnyClient {
  const { endpoint, projectId, apiKey } = readEnv(isServer);
  if (isServer) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const node = require('node-appwrite');
    return new node.Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey || '');
  }
  return new WebClient().setEndpoint(endpoint).setProject(projectId);
}

export function getServerClient(): any {
  if (!isServerRuntime) throw new Error('getServerClient() must be called on the server.');
  if (!global.__appwriteServerClient__) global.__appwriteServerClient__ = createClient(true);
  return global.__appwriteServerClient__ as any;
}

export function getBrowserClient(): WebClientType {
  if (isServerRuntime) throw new Error('getBrowserClient() must be called in the browser.');
  if (!global.__appwriteBrowserClient__) global.__appwriteBrowserClient__ = createClient(false);
  return global.__appwriteBrowserClient__ as WebClientType;
}

// Server-side SDK accessors (use in Route Handlers, Server Actions, RSC)
export function getServerSDK() {
  const client = getServerClient();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const node = require('node-appwrite');
  return {
    client,
    account: new node.Account(client),
    databases: new node.Databases(client),
    storage: new node.Storage(client),
    avatars: new node.Avatars(client),
    functions: new node.Functions(client),
  };
}

// Client-side SDK factory (call within client components/hooks only)
export function getBrowserSDK() {
  const client = getBrowserClient();
  return {
    client,
    account: new WebAccount(client),
    databases: new WebDatabases(client),
    storage: new WebStorage(client),
    avatars: new WebAvatars(client),
    functions: new WebFunctions(client),
  };
}

export { ID, Query };


