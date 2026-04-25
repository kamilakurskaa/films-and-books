import React from 'react';
import './WelcomeScreen.css';

export const WelcomeScreen = ({ onSelectSection }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        <h1 className="welcome-title">📚 Медиатека 🎬</h1>
        <p className="welcome-subtitle">Выберите раздел</p>
        
        <div className="section-buttons">
          <button 
            className="section-btn books-btn"
            onClick={() => onSelectSection('books')}
          >
            <span className="btn-icon">📚</span>
            <span className="btn-title">Книги</span>
            <span className="btn-desc">Добавляйте прочитанные книги</span>
          </button>
          
          <button 
            className="section-btn movies-btn"
            onClick={() => onSelectSection('movies')}
          >
            <span className="btn-icon">🎬</span>
            <span className="btn-title">Фильмы</span>
            <span className="btn-desc">Отслеживайте просмотренные фильмы</span>
          </button>
        </div>
      </div>
    </div>
  );
};