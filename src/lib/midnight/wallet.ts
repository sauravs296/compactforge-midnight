import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import '@midnight-ntwrk/dapp-connector-api';

/**
 * Finds the first available Midnight wallet injected by the browser extension.
 * The 1AM wallet injects under window.midnight with a UUID key — never hardcode 'mnLace'.
 */
function getWallet(): InitialAPI {
  const injected = window.midnight;
  if (!injected) throw new Error('No Midnight wallet extension found. Install the 1AM wallet.');
  const wallets = Object.values(injected);
  if (wallets.length === 0) throw new Error('No Midnight wallet found in window.midnight.');
  return wallets[0];
}

/**
 * Connects to the 1AM wallet on the Preprod network.
 * Returns the ConnectedAPI so callers can access addresses and service config.
 */
export async function connectWallet(): Promise<ConnectedAPI> {
  const wallet = getWallet();
  const connected = await wallet.connect('preprod');
  return connected;
}

/**
 * Returns the caller's unshielded (public) address from the connected wallet.
 * This is the address shown in the CompactForge dashboard.
 */
export async function getUnshieldedAddress(connected: ConnectedAPI): Promise<string> {
  const { unshieldedAddress } = await connected.getUnshieldedAddress();
  return unshieldedAddress;
}

/**
 * Returns the service URI configuration (RPC, indexer, proof server URLs)
 * from the wallet's active network. Used to wire up the Midnight JS SDK providers.
 */
export async function getServiceConfig(connected: ConnectedAPI) {
  return connected.getConfiguration();
}

/**
 * Checks whether the wallet is currently connected and on the correct network.
 */
export async function checkConnectionStatus(connected: ConnectedAPI): Promise<boolean> {
  const status = await connected.getConnectionStatus();
  return status.status === 'connected';
}
