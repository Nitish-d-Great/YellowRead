import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import NewsFeedPage from './pages/NewsFeedPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';
import { getNitroliteService } from './services/nitrolite';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [sessionData, setSessionData] = useState({
    articlesRead: [],
    totalArticles: 0,
    totalCost: 0,
  });
  const [isInitializing, setIsInitializing] = useState(false);

  const nitroliteRef = useRef(null);

  const handleWalletConnect = async (address) => {
    console.log('🔗 Wallet connected:', address);
    setWalletAddress(address);
    setIsInitializing(true);

    try {
      // Initialize Nitrolite Service with REAL SDK
      const nitrolite = getNitroliteService();
      await nitrolite.initialize(address);

      // Create session (may involve wallet signing for real SDK)
      await nitrolite.createSession();

      nitroliteRef.current = nitrolite;
      console.log('✅ Yellow Network session ready');
    } catch (error) {
      console.error('⚠️ Nitrolite initialization error:', error);
      // Continue anyway - service will work in local mode
      nitroliteRef.current = getNitroliteService();
    }

    setIsInitializing(false);
  };

  // OFF-CHAIN article tracking via Nitrolite
  const handleArticleRead = async (articleId) => {
    if (!sessionData.articlesRead.includes(articleId)) {
      // Record in Nitrolite (uses real SDK if connected)
      if (nitroliteRef.current) {
        try {
          const state = await nitroliteRef.current.recordArticleRead(articleId);

          // Defensive: ensure we have valid data
          const articlesRead = Array.isArray(state?.articlesRead)
            ? [...state.articlesRead]
            : [...sessionData.articlesRead, articleId];

          setSessionData({
            articlesRead,
            totalArticles: state?.totalArticles ?? articlesRead.length,
            totalCost: state?.amountOwed ?? articlesRead.length * 0.001,
          });
        } catch (error) {
          console.error('Error recording article read:', error);
          // Fallback: update locally even if nitrolite fails
          setSessionData(prev => ({
            articlesRead: [...prev.articlesRead, articleId],
            totalArticles: prev.totalArticles + 1,
            totalCost: (prev.totalArticles + 1) * 0.001,
          }));
        }
      } else {
        // No nitrolite service, update locally
        setSessionData(prev => ({
          articlesRead: [...prev.articlesRead, articleId],
          totalArticles: prev.totalArticles + 1,
          totalCost: (prev.totalArticles + 1) * 0.001,
        }));
      }
    }
  };

  const handlePaymentComplete = async () => {
    // Reset Nitrolite and create new session
    if (nitroliteRef.current) {
      nitroliteRef.current.reset();
      await nitroliteRef.current.createSession();
    }

    setSessionData({
      articlesRead: [],
      totalArticles: 0,
      totalCost: 0,
    });
  };

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              onWalletConnect={handleWalletConnect}
              walletAddress={walletAddress}
              isInitializing={isInitializing}
            />
          }
        />
        <Route
          path="/feed"
          element={
            <NewsFeedPage
              walletAddress={walletAddress}
              sessionData={sessionData}
              onArticleRead={handleArticleRead}
            />
          }
        />
        <Route
          path="/payment"
          element={
            <PaymentPage
              walletAddress={walletAddress}
              sessionData={sessionData}
              nitrolite={nitroliteRef.current}
            />
          }
        />
        <Route
          path="/confirmation"
          element={
            <ConfirmationPage
              walletAddress={walletAddress}
              sessionData={sessionData}
              onNewSession={handlePaymentComplete}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;