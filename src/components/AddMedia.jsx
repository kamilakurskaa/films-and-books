import React from "react";
import "../App.css";

export class AddMedia extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            mediaType: 'book',
        };
    }

    render() {
        const { onAdd } = this.props;

        return (
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    if (this.state.title.trim()) {
                        onAdd(this.state.title, this.state.mediaType);
                        this.setState({
                            title: '',
                            mediaType: 'book',
                        });
                    }
                }}
            >
                <div style={{ display: 'flex', gap: '12px', marginTop: '48px' }}>
                    <select
                        className="media-type-select"
                        value={this.state.mediaType}
                        onChange={({ target: { value } }) => this.setState({ mediaType: value })}
                        style={{
                            padding: '16px 24px',
                            fontSize: '24px',
                            borderRadius: '64px',
                            backgroundColor: 'rgba(255, 255, 255, 0.24)',
                            color: '#ffffff',
                            border: 'none',
                            outline: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        <option value="book">📚 Книга</option>
                        <option value="movie">🎬 Фильм</option>
                    </select>

                    <input
                        className="add-task"
                        type="text"
                        placeholder="Введите название..."
                        value={this.state.title}
                        onChange={({ target: { value } }) => this.setState({ title: value })}
                        required
                        autoFocus
                        style={{ flex: 1 }}
                    />

                    <button
                        type="submit"
                        style={{
                            padding: '16px 32px',
                            fontSize: '24px',
                            borderRadius: '64px',
                            backgroundColor: 'rgba(255, 255, 255, 0.24)',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                    >
                        +
                    </button>
                </div>
            </form>
        );
    }
}