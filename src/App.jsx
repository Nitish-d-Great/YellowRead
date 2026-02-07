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

  const nitroliteRef = useRef(null);

  const handleWalletConnect = async (address) => {
    console.log('🔗 Wallet connected:', address);
    setWalletAddress(address);

    // Initialize Nitrolite Service
    const nitrolite = getNitroliteService();
    await nitrolite.initialize(address);
    nitrolite.createSession();
    nitroliteRef.current = nitrolite;
  };

  // OFF-CHAIN article tracking via Nitrolite
  const handleArticleRead = (articleId) => {
    if (!sessionData.articlesRead.includes(articleId)) {
      // Record in Nitrolite (off-chain, no signing)
      if (nitroliteRef.current) {
        const state = nitroliteRef.current.recordArticleRead(articleId);

        setSessionData({
          articlesRead: [...state.articlesRead],
          totalArticles: state.totalArticles,
          totalCost: state.amountOwed,
        });
      }
    }
  };

  const handlePaymentComplete = () => {
    // Reset Nitrolite and create new session
    if (nitroliteRef.current) {
      nitroliteRef.current.reset();
      nitroliteRef.current.createSession();
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