import { describe, it, expect } from 'vitest';
import { connectWallet, getUnshieldedAddress } from './wallet';

describe('Wallet Utilities', () => {
  it('connectWallet throws when no wallet extension is present', async () => {
    // In a jsdom environment window.midnight is undefined
    await expect(connectWallet()).rejects.toThrow('No Midnight wallet extension found');
  });

  it('connectWallet throws when window.midnight has no wallets', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).midnight = {};
    await expect(connectWallet()).rejects.toThrow('No Midnight wallet found');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).midnight;
  });
});
