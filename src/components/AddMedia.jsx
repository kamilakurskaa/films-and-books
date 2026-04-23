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
                            backgroundColor: '#1a5d2e',
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