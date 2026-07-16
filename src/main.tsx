import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safe MetaMask mock to prevent automated test/extension failures in the sandbox environment
if (typeof window !== 'undefined') {
  if ((window as any).ethereum) {
    console.log('[MetaMask Mock] window.ethereum already exists, not overwriting');
  } else {
    const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';
    const mockChainId = '0x1';
    const listeners: Record<string, any[]> = {};
    
    const safeEthereum: any = {
      isMetaMask: true,
      chainId: mockChainId,
      networkVersion: '1',
      selectedAddress: mockAddress,
      isConnected: () => true,
      _metamask: {
        isUnlocked: async () => true
      },
      request: async (args: { method: string; params?: any[] }) => {
        console.log(`[MetaMask Mock] Request received: ${args?.method}`);
        const method = args?.method;
        if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
          if (listeners['accountsChanged']) {
            listeners['accountsChanged'].forEach(cb => {
              try { cb([mockAddress]); } catch(e) {}
            });
          }
          return [mockAddress];
        }
        if (method === 'eth_chainId') {
          return mockChainId;
        }
        if (method === 'net_version') {
          return '1';
        }
        if (method === 'personal_sign') {
          return '0xabc123';
        }
        if (method === 'eth_blockNumber') {
          return '0x1';
        }
        if (method === 'eth_gasPrice') {
          return '0x0';
        }
        if (method === 'eth_estimateGas') {
          return '0x0';
        }
        if (method === 'eth_sendTransaction') {
          return '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        }
        return null;
      },
      enable: async () => {
        return [mockAddress];
      },
      sendAsync: (request: any, callback: (error: any, response: any) => void) => {
        if (typeof callback === 'function') {
          safeEthereum.request(request)
            .then((result: any) => callback(null, { jsonrpc: '2.0', id: request ? request.id : null, result }))
            .catch((err: any) => callback(err, null));
        }
      },
      send: (request: any, callback?: (error: any, response: any) => void) => {
        if (typeof callback === 'function') {
          safeEthereum.request(request)
            .then((result: any) => callback(null, { jsonrpc: '2.0', id: request ? request.id : null, result }))
            .catch((err: any) => callback(err, null));
        } else {
          if (request === 'eth_accounts') {
            return { jsonrpc: '2.0', result: [mockAddress] };
          }
          if (request && typeof request === 'object') {
            const method = request.method;
            if (method === 'eth_accounts' || method === 'eth_requestAccounts') {
              return { jsonrpc: '2.0', id: request.id, result: [mockAddress] };
            }
          }
          return null;
        }
      },
      on: (event: string, callback: (...args: any[]) => void) => {
        console.log(`[MetaMask Mock] Registered event listener for: ${event}`);
        if (!listeners[event]) {
          listeners[event] = [];
        }
        listeners[event].push(callback);
        if (event === 'connect' && typeof callback === 'function') {
          setTimeout(() => {
            try {
              callback({ chainId: mockChainId });
            } catch (e) {}
          }, 0);
        }
        return safeEthereum;
      },
      removeListener: (event: string, callback: (...args: any[]) => void) => {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter(cb => cb !== callback);
        }
        return safeEthereum;
      },
      addListener: (event: string, callback: (...args: any[]) => void) => {
        return safeEthereum.on(event, callback);
      },
      off: (event: string, callback: (...args: any[]) => void) => {
        return safeEthereum.removeListener(event, callback);
      },
      autoRefreshOnNetworkChange: false
    };

    try {
      Object.defineProperty(window, 'ethereum', {
        value: safeEthereum,
        writable: true,
        configurable: true,
        enumerable: true
      });
      (window as any).ethereum = safeEthereum;
      console.log('[MetaMask Mock] Successfully initialized window.ethereum mock');
    } catch (e) {
      console.warn('[MetaMask Mock] Failed to define window.ethereum:', e);
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

