import React from 'react';
import './ArticleCard.css';

const ArticleCard = ({ article, isRead, onClick }) => {
  return (
    <article 
      className={`article-card ${isRead ? 'read' : ''}`}
      onClick={onClick}
    >
      {/* Image */}
      <div className="article-image">
        <img src={article.image} alt={article.title} loading="lazy" />
        <span className="article-category">{article.category}</span>
        {isRead && (
          <div className="read-indicator">
            <span>✓ Read</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="article-content">
        <h3 className="article-title">{article.title}</h3>
        <p className="article-summary">{article.summary}</p>
        
        {/* Meta */}
        <div className="article-meta">
          <div className="meta-left">
            <span className="meta-author">✍️ {article.author}</span>
            <span className="meta-time">⏱️ {article.readTime}</span>
          </div>
          <span className="meta-date">{article.publishedAt}</span>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="article-overlay">
        <span className="overlay-text">
          {isRead ? 'Read Again' : 'Read Article'}
        </span>
        {!isRead && (
          <span className="overlay-note">Reading will be counted</span>
        )}
      </div>
    </article>
  );
};

export default ArticleCard;
