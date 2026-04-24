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
                    backgroundColor: isSelected ? 'rgba(46, 139, 86, 0.15)' : 'rgba(255, 255, 255, 0.24)',
                    border: isSelected ? '2px solid #2e8b57' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
            >
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: "bold", fontSize: '32px' }}>
                            {index + 1}.
                        </span>
                        <span style={{ fontSize: '28px' }}>
                            {item.type === 'book' ? '📚' : '🎬'}
                        </span>
                        <span
                            style={{
                                fontSize: '32px',
                                fontWeight: '500',
                            }}
                        >
                            {item.title}
                            {isSelected && (
                                <span style={{ fontSize: '16px', marginLeft: '12px', color: '#2e8b57' }}>
                                    ✓ Выбрано
                                </span>
                            )}
                        </span>
                        <StarRating rating={item.rating} onRate={(rating) => onRate(item, rating)} />
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Чтобы не сработал выбор элемента
                                onDelete(item);
                            }}
                            style={{
                                background: 'rgba(255, 0, 0, 0.3)',
                                border: 'none',
                                borderRadius: '16px',
                                padding: '8px 16px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '18px',
                            }}
                        >
                            🗑️
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Чтобы не сработал выбор элемента
                                this.setState({ showReviewInput: !showReviewInput });
                            }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                borderRadius: '16px',
                                padding: '8px 16px',
                                color: '#1a5d2e',
                                cursor: 'pointer',
                                fontSize: '18px',
                            }}
                        >
                            {item.review ? '✏️ Изменить отзыв' : '💬 Добавить отзыв'}
                        </button>
                    </div>

                    {item.review && !showReviewInput && (
                        <div
                            style={{
                                marginTop: '16px',
                                padding: '12px 16px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                fontSize: '20px',
                                fontStyle: 'italic',
                            }}
                        >
                            💭 {item.review}
                        </div>
                    )}

                    {showReviewInput && (
                        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                            <input
                                type="text"
                                placeholder="Ваш отзыв..."
                                value={reviewText}
                                onChange={(e) => this.setState({ reviewText: e.target.value })}
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    fontSize: '18px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    outline: 'none',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }}
                            />
                            <button
                                onClick={() => {
                                    onReview(item, reviewText);
                                    this.setState({ showReviewInput: false });
                                }}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#4CAF50',
                                    border: 'none',
                                    borderRadius: '16px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '16px',
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