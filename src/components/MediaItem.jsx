import React from "react";
import "../App.css";

const StarRating = ({ rating, onRate }) => {
    const [hoverRating, setHoverRating] = React.useState(0);

    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => onRate(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                        fontSize: '32px',
                        cursor: 'pointer',
                        color: star <= (hoverRating || rating) ? '#2e8b57' : '#d0e0d0',
                        transition: 'all 0.2s',
                        transform: hoverRating === star ? 'scale(1.1)' : 'scale(1)',
                        display: 'inline-block',
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export class MediaItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showReviewInput: false,
            reviewText: props.item.review || '',
        };
    }

    render() {
        const { item, index, onDelete, onRate, onReview, onSelectItem, isSelected } = this.props;
        const { showReviewInput, reviewText } = this.state;

        return (
            <li
                className="task-item"
                onClick={() => {
                    console.log('Item clicked:', item);
                    if (onSelectItem) {
                        onSelectItem(item);
                    }
                }}
                style={{
                    backgroundColor: isSelected ? '#f8fff8' : 'rgba(255, 255, 255, 0.9)',
                    border: isSelected ? '2px solid #2e8b57' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
            >
                <div classname="task-content">
                    <div classname="task-header">
                        <span className="task-number">
                            {index + 1}.
                        </span>
                            <div className="task-title-wrapper">
                                <span className="task-icon">{item.type === 'book' ? '📚' : '🎬'}</span>
                                <span className="task-title">
                                    {item.title}
                                    {isSelected && (
                                        <span style={{ fontSize: '12px', marginLeft: '8px', color: '#2e8b57' }}>
                                            ✓ Выбрано
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="star-rating">
                                <StarRating rating={item.rating} onRate={(rating) => onRate(item, rating)} />
                            </div>
                            <div className="task-actions">
                                <button
                                    className="delete-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(item);
                                    }}
                                >
                                    🗑️
                                </button>
                                <button
                                    className="review-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        this.setState({ showReviewInput: !showReviewInput });
                                    }}
                                    style={{
                                        background: '#e8f5e9',
                                        border: 'none',
                                        borderRadius: '16px',
                                        padding: '8px 16px',
                                        color: '#1a5d2e',
                                    }}
                                >
                                    {item.review ? '✏️' : '💬'}
                                    <span style={{ marginLeft: '4px', fontSize: '12px' }}>
                                        {item.review ? 'Изменить' : 'Отзыв'}
                                    </span>
                                </button>
                            </div>
                    </div>

                    {item.review && !showReviewInput && (
                        <div className="review-text">
                            💭 {item.review}
                        </div>
                    )}

                    {showReviewInput && (
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="Ваш отзыв..."
                                value={reviewText}
                                onChange={(e) => this.setState({ reviewText: e.target.value })}
                                style={{
                                    flex: 1,
                                    padding: '10px 12px',
                                    fontSize: '14px',
                                    borderRadius: '12px',
                                    border: '1px solid #2e8b57',
                                    outline: 'none',
                                    minWidth: '150px',
                                }}
                            />
                            <button
                                onClick={() => {
                                    onReview(item, reviewText);
                                    this.setState({ showReviewInput: false });
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#2e8b57',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                Сохранить
                            </button>
                        </div>
                    )}
                </div>
            </li>
        );
    }
}