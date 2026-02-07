import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { articles as demoArticles } from '../data/articles';
import { fetchWeb3News } from '../services/newsApi';
import ArticleCard from '../components/ArticleCard';
import BillingCounter from '../components/BillingCounter';
import Header from '../components/Header';
import './NewsFeedPage.css';

const NewsFeedPage = ({ walletAddress, sessionData, onArticleRead }) => {
  const navigate = useNavigate();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showBillingAlert, setShowBillingAlert] = useState(false);

  // News state
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newsSource, setNewsSource] = useState('Demo');
  const [error, setError] = useState(null);

  // Fetch real-time news on mount
  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchWeb3News(12);

        if (result && result.articles.length > 0) {
          setArticles(result.articles);
          setNewsSource(result.source);
        } else {
          // Fallback to demo articles
          setArticles(demoArticles);
          setNewsSource('Demo');
        }
      } catch (err) {
        console.error('Failed to load news:', err);
        setError('Failed to load live news. Showing demo articles.');
        setArticles(demoArticles);
        setNewsSource('Demo');
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
  }, []);

  // Calculate billing
  const articlesRead = sessionData.articlesRead.length;
  const totalCost = sessionData.totalCost || articlesRead * 0.001;

  // Show billing alert when a new pair is completed
  useEffect(() => {
    if (articlesRead > 0) {
      setShowBillingAlert(true);
      setTimeout(() => setShowBillingAlert(false), 3000);
    }
  }, [articlesRead]);


  const handleArticleClick = (article) => {
    setSelectedArticle(article);

    // Record the read if not already read
    if (!sessionData.articlesRead.includes(article.id)) {
      onArticleRead(article.id);
    }
  };

  const handleCloseArticle = () => {
    setSelectedArticle(null);
  };

  const handleSettlePayment = () => {
    if (totalCost > 0) {
      navigate('/payment');
    }
  };

  const handleRefreshNews = async () => {
    setIsLoading(true);
    try {
      const result = await fetchWeb3News(12);
      if (result && result.articles.length > 0) {
        setArticles(result.articles);
        setNewsSource(result.source);
        setError(null);
      }
    } catch (err) {
      setError('Failed to refresh news.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadOriginal = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="newsfeed-page">
      <Header walletAddress={walletAddress} />

      {/* Billing Alert */}
      {showBillingAlert && (
        <div className="billing-alert">
          <span className="alert-icon">💰</span>
          <span>Charged 0.001 ETH for 1 article!</span>
        </div>
      )}

      {/* Main Content */}
      <div className="newsfeed-container">
        {/* Sidebar - Billing Dashboard */}
        <aside className="billing-sidebar">
          <BillingCounter
            articlesRead={articlesRead}
            totalCost={totalCost}
          />

          {/* Reading Progress */}
          <div className="reading-progress">
            <h3>📚 Reading Progress</h3>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(articlesRead / articles.length) * 100}%` }}
              />
            </div>
            <p>{articlesRead} of {articles.length} articles read</p>
          </div>

          {/* Settle Button */}
          {totalCost > 0 && (
            <button
              className="settle-button"
              onClick={handleSettlePayment}
            >
              <span>💳</span>
              Settle & Pay ({totalCost.toFixed(4)} ETH)
            </button>
          )}

          {/* News Source Info */}
          <div className="news-source-info">
            <div className="source-header">
              <span className="source-icon">📡</span>
              <span>News Source</span>
            </div>
            <div className="source-badge">
              <span className={`source-dot ${newsSource !== 'Demo' ? 'live' : ''}`} />
              <span>{newsSource}</span>
              {newsSource !== 'Demo' && <span className="live-badge">LIVE</span>}
            </div>
            <button
              className="refresh-button"
              onClick={handleRefreshNews}
              disabled={isLoading}
            >
              {isLoading ? '⏳ Loading...' : '🔄 Refresh News'}
            </button>
          </div>

          {/* How It Works */}
          <div className="how-it-works">
            <h4>How Billing Works</h4>
            <ul>
              <li><span>1️⃣</span> Read articles freely</li>
              <li><span>2️⃣</span> Every article = 0.001 ETH</li>
              <li><span>3️⃣</span> Settle payment anytime</li>
              <li><span>4️⃣</span> Off-chain until settlement</li>
            </ul>
          </div>
        </aside>

        {/* Articles Grid */}
        <main className="articles-main">
          <div className="articles-header">
            <div className="header-left">
              <h2>📰 {newsSource !== 'Demo' ? 'Live Web3 News' : 'Latest News'}</h2>
              <p className="articles-subtitle">
                {articlesRead === 0
                  ? 'Start reading to see your billing update'
                  : `Reading ${articlesRead} articles • ${totalCost.toFixed(4)} ETH billed`
                }
              </p>
            </div>
            {newsSource !== 'Demo' && (
              <div className="live-indicator">
                <span className="live-dot" />
                <span>Real-time from {newsSource}</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="news-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="loading-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="loading-card">
                  <div className="loading-image" />
                  <div className="loading-content">
                    <div className="loading-title" />
                    <div className="loading-text" />
                    <div className="loading-text short" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="articles-grid">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isRead={sessionData.articlesRead.includes(article.id)}
                  onClick={() => handleArticleClick(article)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="article-modal-overlay" onClick={handleCloseArticle}>
          <div className="article-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseArticle}>
              ✕
            </button>

            <div className="modal-image">
              <img src={selectedArticle.image} alt={selectedArticle.title} />
              <span className="modal-category">{selectedArticle.category}</span>
            </div>

            <div className="modal-content">
              <h1>{selectedArticle.title}</h1>

              <div className="modal-meta">
                <span>✍️ {selectedArticle.author}</span>
                <span>⏱️ {selectedArticle.readTime}</span>
                <span>🕐 {selectedArticle.publishedAt}</span>
                {selectedArticle.source && (
                  <span>📰 {selectedArticle.source}</span>
                )}
              </div>

              <p className="modal-summary">{selectedArticle.summary}</p>

              <div className="modal-body">
                {selectedArticle.content.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/* Source Link */}
              {selectedArticle.url && (
                <button
                  className="read-original-button"
                  onClick={() => handleReadOriginal(selectedArticle.url)}
                >
                  <span>🔗</span>
                  Read Full Article on {selectedArticle.source || 'Source'}
                  <span>↗</span>
                </button>
              )}

              {sessionData.articlesRead.includes(selectedArticle.id) && (
                <div className="read-badge">
                  ✓ Article Read - Counted towards billing
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsFeedPage;
