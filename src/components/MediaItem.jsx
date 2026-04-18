import React from "react";
import "../App.css";

const StarRating = ({ rating, onRate }) => {
    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => onRate(star)}
                    style={{
                        fontSize: '28px',
                        cursor: 'pointer',
                        color: star <= rating ? '#FFD700' : '#555',
                        transition: 'color 0.2s',
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
        const { item, index, onDelete, onRate, onReview } = this.props;
        const { showReviewInput, reviewText } = this.state;

        return (
            <li className="task-item">
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
                        </span>
                        <StarRating rating={item.rating} onRate={(rating) => onRate(item, rating)} />
                        <button
                            onClick={() => onDelete(item)}
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
                            onClick={() => this.setState({ showReviewInput: !showReviewInput })}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                borderRadius: '16px',
                                padding: '8px 16px',
                                color: '#fff',
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