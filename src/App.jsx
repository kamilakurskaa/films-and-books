import React from 'react';
import { createAssistant, createSmartappDebugger } from '@salutejs/client';

import './App.css';
import { MediaList } from './pages/MediaList';
import { WelcomeScreen } from './components/WelcomeScreen';

const initializeAssistant = (getState, getRecoveryState) => {
  if (process.env.NODE_ENV === 'development') {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? '',
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,                                                                                     
      nativePanel: {
        defaultText: 'добавь книгу',
        screenshotMode: false,
        tabIndex: -1,
    },
    });
  } else {
  return createAssistant({ getState });
  }
};

export class App extends React.Component {
  constructor(props) {
    super(props);
      console.log('constructor');

      const savedBooks = this.loadFromStorage('media_tracker_books');
      const savedMovies = this.loadFromStorage('media_tracker_movies');
      const savedSelectedId = localStorage.getItem('media_tracker_selected_id');
      const savedSelectedTitle = localStorage.getItem('media_tracker_selected_title');

      this.state = {
          currentSection: null,  
          selectedItemId: savedSelectedId || null,
          selectedItemTitle: savedSelectedTitle || null,
          books: savedBooks.length > 0 ? savedBooks : [
              {
                  id: '1',
                  title: 'Война и мир',
                  type: 'book',
                  rating: 5,
                  review: 'Шедевр',
                  date: '2026-01-15'
              }
          ],
          movies: savedMovies.length > 0 ? savedMovies : [
              {
                  id: '2',
                  title: 'Твоё сердце будет разбито',
                  type: 'movie',
                  rating: 4,
                  review: 'Отличный сюжет',
                  date: '2026-05-15'
              }
          ],
      };

      this.assistant = initializeAssistant(() => this.getStateForAssistant());
      window.assistant = this.assistant;

    this.assistant.on('data', (event) => {
      console.log(`assistant.on(data)`, event);
      if (event.type === 'character') {
        console.log(`assistant.on(data): character: "${event?.character?.id}"`);
      } else if (event.type === 'insets') {
        console.log(`assistant.on(data): insets`);
      } else {
        const { action } = event;
        this.dispatchAssistantAction(action);
      }
    });

    this.assistant.on('start', (event) => {
      let initialData = this.assistant.getInitialData();

      console.log(`assistant.on(start)`, event, initialData);
    });

    this.assistant.on('command', (event) => {
      console.log(`assistant.on(command)`, event);
    });

    this.assistant.on('error', (event) => {
      console.log(`assistant.on(error)`, event);
    });

    this.assistant.on('tts', (event) => {
      console.log(`assistant.on(tts)`, event);
    });
  }

    loadFromStorage(key) {
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                const items = JSON.parse(saved);
                console.log('Loaded from storage:', key, items.length, 'items');
                return items;
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
        }
        return [];
    }


    getCurrentItems() {
        return this.state.currentSection === 'books' ? this.state.books : this.state.movies;
    }

    getCurrentStorageKey() {
        return this.state.currentSection === 'books' ? 'media_tracker_books' : 'media_tracker_movies';
    }

    updateCurrentItems(newItems) {
        const key = this.getCurrentStorageKey();
        const stateField = this.state.currentSection === 'books' ? 'books' : 'movies';

        this.setState({ [stateField]: newItems }, () => {
            localStorage.setItem(key, JSON.stringify(newItems));
            console.log('Saved to', key, ':', newItems.length, 'items');
        });
    }

    /*// Сохранение данных в localStorage
    saveToStorage(items) {
        try {
            localStorage.setItem('media_tracker_items', JSON.stringify(items));
            console.log('Saved to storage:', items.length, 'items');
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }

    // Обновляем состояние и сохраняем
    updateItemsAndSave(newItems) {
        this.setState({ items: newItems }, () => {
            this.saveToStorage(this.state.items);
        });
    }*/

    clear_all_items = () => {
        console.log('clear_all_items');
        this.updateCurrentItems([]);  
        this._send_action_value('clear_all', 'Все элементы удалены');
    }

  componentDidMount() {
    console.log('componentDidMount');
  }

    getStateForAssistant() {
        console.log('getStateForAssistant: this.state:', this.state);

        const currentItems = this.getCurrentItems();
        let selectedIndex = -1;

        if (this.state.selectedItemId) {
            selectedIndex = currentItems.findIndex(item => item.id === this.state.selectedItemId);
        }

        const state = {
            current_section: this.state.currentSection,
            active_item_id: this.state.selectedItemId,
            selected_item: selectedIndex >= 0 ? {
                index: selectedIndex,
                id: this.state.selectedItemId,
                title: this.state.selectedItemTitle
            } : null,
            item_selector: {
                items: currentItems.map(({ id, title, type, rating }, index) => ({
                    number: index + 1,
                    id,
                    title,
                    type,
                    rating: rating || 0,
                })),
                ignored_words: [
                    'добавь', 'добавить', 'запиши', 'поставь',
                    'удалить', 'удали',
                    'оцени', 'поставь оценку',
                    'отзыв', 'напиши отзыв', 'оставь отзыв'
                ],
            },
        };

        console.log('getStateForAssistant: active_item_id:', state.active_item_id);
        return state;
    }

  dispatchAssistantAction(action) {
    console.log('dispatchAssistantAction', action);
    if (action) {
      switch (action.type) {
        case 'add_media':
              return this.add_media(action);

        case 'select_item':
                return this.select_item(action);

        case 'rate_media':
          return this.rate_media(action);

        case 'delete_media':
              return this.delete_media(action);

        case 'review_media':
              return this.review_media(action);

        case 'clear_all':
              return this.clear_all_items();



        default:
              console.warn('Unknown action type:', action.type);
      }
    }
    }

    add_media(action) {
        console.log('add_media', action);

        let title = action.title;
        if (Array.isArray(title)) {
            title = title.join(' ');
        }

        // Очистка от слов "книгу", "фильм"
        if (title && typeof title === 'string') {
            title = title.replace(/^(книгу|фильм)\s+/i, '').trim();
        }

        // Делаем первую букву заглавной
        if (title && title.length > 0) {
            title = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
        }

        const newItem = {
            id: Math.random().toString(36).substring(7),
            title: title,
            type: this.state.currentSection === 'books' ? 'book' : 'movie',
            rating: 0,
            review: '',
            date: new Date().toISOString().split('T')[0],
        };

        const currentItems = this.getCurrentItems();
        this.updateCurrentItems([...currentItems, newItem]);
    }

    select_item(action) {
        console.log('select_item called with action:', action);

        // Подсвечиваем выбранный элемент (можно добавить визуальное выделение)
        this.setState({
            selectedItemId: action.id,
            selectedItemTitle: action.title
        }, () => {
            // Сохраняем выбранный элемент в localStorage
            localStorage.setItem('media_tracker_selected_id', this.state.selectedItemId);
            localStorage.setItem('media_tracker_selected_title', this.state.selectedItemTitle || '');
        });

        this._send_action_value('item_selected', `Выбран ${action.title}`);

        if (this.assistant && this.assistant.sendState) {
            const currentState = this.getStateForAssistant();
            console.log('Sending state to assistant:', currentState);
            this.assistant.sendState(currentState);
        }
        
    }

    delete_media(action) {
        console.log('delete_media', action);
        const currentItems = this.getCurrentItems();
        this.updateCurrentItems(currentItems.filter(({ id }) => id !== action.id));
    }

    rate_media(action) {
        console.log('rate_media', action);
        if (action.id) {
            const currentItems = this.getCurrentItems();
            this.updateCurrentItems(
                currentItems.map((item) =>
                    item.id === action.id ? { ...item, rating: action.rating } : item
                )
            );
        }
    }

    review_media(action) {
        console.log('review_media', action);
        const selectedId = this.state.selectedItemId;

        if (!selectedId) {
            console.log('No item selected');
            this._send_action_value('error', 'Сначала выберите элемент');
            return;
        }

        let review = action.review;
        if (Array.isArray(review)) {
            review = review.join(' ');
        }

        const currentItems = this.getCurrentItems();
        this.updateCurrentItems(
            currentItems.map((item) =>
                item.id === selectedId ? { ...item, review: review } : item
            )
        );
    }

  _send_action_value(action_id, value) {
    const data = {
      action: {
        action_id: action_id,
        parameters: {
          
          value: value, 
        },
      },
    };
      const unsubscribe = this.assistant.sendData(data, (data) => {
      const { type, payload } = data;
      console.log('sendData onData:', type, payload);
      unsubscribe();
    });
  }

    render() {
        console.log('render, currentSection:', this.state.currentSection);

        // Если раздел не выбран, показываем приветственный экран
        if (!this.state.currentSection) {
            return (
                <WelcomeScreen
                    onSelectSection={(section) => {
                        console.log('Selected section:', section);
                        this.setState({
                            currentSection: section,
                            selectedItemId: null,
                            selectedItemTitle: null
                        });
                    }}
                />
            );
        }

        const currentItems = this.getCurrentItems();
        const sectionTitle = this.state.currentSection === 'books' ? 'Книги' : 'Фильмы';

        return (
            <div className="container">
                <div className="section-header">
                    <button
                        className="back-btn"
                        onClick={() => this.setState({
                            currentSection: null,
                            selectedItemId: null,
                            selectedItemTitle: null
                        })}
                    >
                        ← Назад
                    </button>
                    <h1 className="section-title">{sectionTitle}</h1>
                    {currentItems.length > 0 && (
                        <button className="clear-all-btn" onClick={this.clear_all_items}>
                            🗑️
                        </button>
                    )}
                </div>

                <MediaList
                    items={currentItems}
                    onAdd={(title, mediaType) => {
                        this.add_media({ type: 'add_media', title, mediaType });
                    }}
                    onDelete={(item) => {
                        this.delete_media({ type: 'delete_media', id: item.id });
                    }}
                    onRate={(item, rating) => {
                        this.rate_media({ type: 'rate_media', id: item.id, rating });
                    }}
                    onReview={(item, review) => {
                        this.review_media({ type: 'review_media', id: item.id, review });
                    }}
                    onClearAll={this.clear_all_items}
                />
            </div>
        );
    }
}