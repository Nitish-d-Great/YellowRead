import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

/**
 * Custom hook for MetaMask wallet connection
 */
export function useWallet() {
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum === 'undefined') return;

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);
          setSigner(await web3Provider.getSigner());
          
          const network = await web3Provider.getNetwork();
          setChainId(Number(network.chainId));
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        setAddress(null);
        setIsConnected(false);
        setProvider(null);
        setSigner(null);
      } else {
        setAddress(accounts[0]);
        setIsConnected(true);
        
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);
        setSigner(await web3Provider.getSigner());
      }
    };

    const handleChainChanged = (chainIdHex) => {
      setChainId(parseInt(chainIdHex, 16));
      // Reload to avoid any issues with chain state
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  // Connect wallet function
  const connect = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('Please install MetaMask');
      return null;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Check/switch to Sepolia
      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      if (currentChainId !== '0xaa36a7') {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7',
                chainName: 'Sepolia Testnet',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      // Set up provider and signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();

      setAddress(accounts[0]);
      setIsConnected(true);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setChainId(11155111);

      return accounts[0];
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect (just clears local state - MetaMask stays connected)
  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
  }, []);

  // Sign message helper
  const signMessage = useCallback(async (message) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    return await signer.signMessage(message);
  }, [signer]);

  // Get balance
  const getBalance = useCallback(async () => {
    if (!provider || !address) return null;
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }, [provider, address]);

  return {
    address,
    isConnected,
    isConnecting,
    error,
    chainId,
    provider,
    signer,
    connect,
    disconnect,
    signMessage,
    getBalance,
  };
}

export default useWallet;
