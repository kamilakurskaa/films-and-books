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
          ],
          movies: savedMovies.length > 0 ? savedMovies : [
          ],
          assistantReady: false,
      };

      this.assistant = initializeAssistant(() => this.getStateForAssistant());
      window.assistant = this.assistant;

    this.assistant.on('data', (event) => {
        console.log(`assistant.on(data)`, event);
        // Обработка навигации с пульта
        if (event.type === 'navigation' && event.navigation?.command) {
            const navigationMap = {
                'UP': 'up',
                'DOWN': 'down',
                'LEFT': 'left',
                'RIGHT': 'right',
                'FORWARD': 'forward',
                'BACK': 'back'
            };

            const direction = navigationMap[event.navigation.command];
            if (direction) {
                this.handleNavigation({ direction });
                return;
            }
        }
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
        this.setState({ assistantReady: true });
        ///this.sendWelcomeMessage();
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
                const validItems = Array.isArray(items) ? items.filter(item =>
                    item &&
                    typeof item === 'object' &&
                    item.id &&
                    typeof item.id === 'string' &&
                    item.title &&
                    typeof item.title === 'string'
                ) : [];

                if (validItems.length !== items?.length) {
                    console.warn(`Found ${items?.length - validItems.length} invalid items in ${key}, cleaning...`);
                    localStorage.setItem(key, JSON.stringify(validItems));
                }
                console.log('Loaded from storage:', key, validItems.length, 'items');
                return validItems;
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
            localStorage.removeItem(key);
        }
        return [];
    }


    getCurrentItems() {
        const items = this.state.currentSection === 'books' ? this.state.books : this.state.movies;
        console.log('getCurrentItems - section:', this.state.currentSection, 'items count:', items?.length);
        return items;
    }

    getCurrentStorageKey() {
        return this.state.currentSection === 'books' ? 'media_tracker_books' : 'media_tracker_movies';
    }

    updateCurrentItems(newItems) {
        console.log('updateCurrentItems - START');
        console.log('newItems:', newItems);
        const key = this.getCurrentStorageKey();
        const stateField = this.state.currentSection === 'books' ? 'books' : 'movies';
        console.log('Updating stateField:', stateField, 'with items:', newItems.length);

        this.setState({ [stateField]: newItems }, () => {
            localStorage.setItem(key, JSON.stringify(newItems));
            console.log('Saved to', key, ':', newItems.length, 'items');
            console.log('State after update -', stateField, ':', this.state[stateField]);

            // Принудительное обновление
            ///this.forceUpdate();
        });
    }

    

    clear_all_items = () => {
        console.log('clear_all_items');
        this.updateCurrentItems([]);  
        this._send_action_value('clear_all', 'Все элементы удалены');
    }

    componentDidMount() {
        if (this.assistant) {
            this.assistant.on('back', () => {
                console.log('Back event from assistant');
            });
        }

        // Для эмулятора и тестирования на клавиатуре
        window.addEventListener('keydown', this.handleKeyDown);

        // Обработка истории браузера
        window.addEventListener('popstate', this.handlePopState);

        if (window.history.pushState && !window.location.pathname.includes('/books') && !window.location.pathname.includes('/movies')) {
            this.pushHistoryState(null);
        }
        if (process.env.NODE_ENV === 'development') {
            window.testBack = () => {
                console.log('🧪 TEST: Simulating BACK button');
                console.log('Current section:', this.state.currentSection);
                console.log('Selected item:', this.state.selectedItemId);

                // Показываем текущее состояние до навигации
                const beforeState = {
                    currentSection: this.state.currentSection,
                    selectedItemId: this.state.selectedItemId
                };
                console.log('Before navigation:', beforeState);

                // Выполняем навигацию
                this.handleNavigation({ direction: 'back' });

                // Проверяем состояние после (с небольшой задержкой)
                setTimeout(() => {
                    console.log('After navigation:', {
                        currentSection: this.state.currentSection,
                        selectedItemId: this.state.selectedItemId
                    });
                }, 100);
            };
        }
    }
    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('popstate', this.handlePopState);
    }
    sendWelcomeMessage = () => {
        if (!this.assistant) {
            console.log('Assistant not ready yet');
            return;
        }

        const currentSection = this.state.currentSection;

        let message = "";

        if (!currentSection) {
            // На главном экране выбора разделов
            message = "Добро пожаловать в Медиатеку! Я помогу вам вести коллекцию книг и фильмов. Скажите «Перейди в книги» или «Перейди в фильмы», чтобы начать.";
        } 
        // Отправляем приветствие ассистенту
        this._send_action_value('welcome', message);
    }
    handlePopState = (event) => {
        console.log('popstate event:', event.state);

        // Если это наше событие (от pushState)
        if (event.state && event.state.fromApp) {
            const targetSection = event.state.section;

            // Текущий раздел
            const currentSection = this.state.currentSection;

            // Если целевой раздел совпадает с текущим - ничего не делаем
            if (targetSection === currentSection) {
                console.log('Popstate: same section, ignoring');
                return;
            }

            // Возврат на главный экран
            if (!targetSection && currentSection) {
                console.log('Popstate: navigating back to main screen');
                // Используем handleNavigation для единообразной обработки
                this.handleNavigation({ direction: 'back' });
            }
            // Переключение на раздел книг
            else if (targetSection === 'books') {
                console.log('Popstate: navigating to books');
                if (currentSection !== 'books') {
                    this.switch_section({ section: 'books' });
                }
            }
            // Переключение на раздел фильмов
            else if (targetSection === 'movies') {
                console.log('Popstate: navigating to movies');
                if (currentSection !== 'movies') {
                    this.switch_section({ section: 'movies' });
                }
            }
        } else {
            // Если событие не от нашего приложения (например, ввод URL вручную)
            console.log('Popstate: external navigation, checking URL');
            this.syncSectionFromURL();
        }
    };
    syncSectionFromURL = () => {
        const path = window.location.pathname;

        if (path === '/books') {
            if (this.state.currentSection !== 'books') {
                this.setState({
                    currentSection: 'books',
                    selectedItemId: null,
                    selectedItemTitle: null
                });
            }
        } else if (path === '/movies') {
            if (this.state.currentSection !== 'movies') {
                this.setState({
                    currentSection: 'movies',
                    selectedItemId: null,
                    selectedItemTitle: null
                });
            }
        } else {
            if (this.state.currentSection !== null) {
                this.setState({
                    currentSection: null,
                    selectedItemId: null,
                    selectedItemTitle: null
                });
            }
        }
    };
    pushHistoryState = (section, replace = false) => {
        if (window.history.pushState) {
            let url = '/';
            if (section === 'books') url = '/books';
            else if (section === 'movies') url = '/movies';

            const state = { section: section, fromApp: true };

            if (replace) {
                window.history.replaceState(state, '', url);
                console.log('History replaced:', url);
            } else {
                window.history.pushState(state, '', url);
                console.log('History pushed:', url);
            }
        }
    };
    handleNavigation = (payload = {}) => {
        const direction = String(payload.direction || '').toLowerCase().trim();  // добавил trim()
        console.log('Navigation direction:', JSON.stringify(direction));
        console.log('Direction === "back"?', direction === 'back');

        if (direction === 'back') {
            console.log('✅ ENTERED BACK BLOCK');

            const activeElement = document.activeElement;
            const isInputFocused = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.getAttribute('contenteditable') === 'true'
            );

            if (isInputFocused) {
                console.log('Input focused, blurring');
                activeElement.blur();
                return;
            }

            if (this.state.selectedItemId) {
                console.log('Clearing selected item');
                this.setState({
                    selectedItemId: null,
                    selectedItemTitle: null
                }, () => {
                    localStorage.removeItem('media_tracker_selected_id');
                    localStorage.removeItem('media_tracker_selected_title');
                });
                return;
            }

            console.log('Current section:', this.state.currentSection);
            if (this.state.currentSection) {
                console.log('Returning to main screen');
                this.pushHistoryState(null);
                this.setState({
                    currentSection: null,
                    selectedItemId: null,
                    selectedItemTitle: null
                }, () => {
                    localStorage.removeItem('media_tracker_selected_id');
                    localStorage.removeItem('media_tracker_selected_title');
                });
                return;
            }

            console.log('Already on main screen');
        } else {
            console.log('❌ Direction is not "back", it is:', direction);
        }
    };

    handleKeyDown = (e) => {
        const activeElement = document.activeElement;
        const isInputFocused = activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.getAttribute('contenteditable') === 'true'
        );

        if (isInputFocused) {
            if (e.key === 'Escape') {
                activeElement.blur();
                e.preventDefault();
                this.handleNavigation({ direction: 'back' });
            }
            return;
        }

        /*if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'ArrowLeft') {
            e.preventDefault();
            this.handleNavigation({ direction: 'back' });
        }*/
        console.log('Key pressed (ignored):', e.key);
    };
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

        case 'switch_section':
              return this.switch_section(action);



        default:
              console.warn('Unknown action type:', action.type);
      }
    }
    }

    switch_section(action) {
        console.log('switch_section', action);

        const targetSection = action.section;

        if (targetSection === 'books' || targetSection === 'movies') {
            if (document.activeElement && document.activeElement.blur) {
                document.activeElement.blur();
            }
            this.setState({
                currentSection: targetSection,
                selectedItemId: null,
                selectedItemTitle: null
            }, () => {
                localStorage.setItem('media_tracker_current_section', targetSection);
                this.pushHistoryState(targetSection);

                const sectionName = targetSection === 'books' ? 'книги' : 'фильмы';
                this._send_action_value('section_switched', `Переключился на раздел ${sectionName}`);

                if (this.assistant && this.assistant.sendState) {
                    const currentState = this.getStateForAssistant();
                    this.assistant.sendState(currentState);
                }
            });
        } else {
            console.error('Unknown section:', targetSection);
            this._send_action_value('error', 'Не могу переключиться в этот раздел');
        }
    }

    add_media(action) {
        console.log('add_media', action);

        let title = action.title;

        if (Array.isArray(title)) {
            title = title.join(' ');
        }

        // Определяем тип медиа из текста (если не передан явно)
        let detectedType = null;
        let cleanTitle = title;

        if (title && typeof title === 'string') {
            const titleLower = title.toLowerCase();

            // Проверяем явное указание типа в тексте
            if (titleLower.includes('книг') || titleLower.includes('роман') || titleLower.includes('повесть')) {
                detectedType = 'book';
                cleanTitle = title.replace(/^(книгу|книга|книги|роман|повесть)\s+/i, '').trim();
            } else if (titleLower.includes('фильм') || titleLower.includes('кино') || titleLower.includes('сериал')) {
                detectedType = 'movie';
                cleanTitle = title.replace(/^(фильм|фильма|фильмы|кино|сериал)\s+/i, '').trim();
            }
        }

        // Если тип определён из текста и он не соответствует текущему разделу
        const currentMediaType = this.state.currentSection === 'books' ? 'book' : 'movie';
        const needSwitch = detectedType && detectedType !== currentMediaType;

        // Если нужно переключить раздел
        if (needSwitch && this.state.currentSection) {
            const targetSection = detectedType === 'book' ? 'books' : 'movies';
            const targetSectionName = detectedType === 'book' ? 'книги' : 'фильмы';
            const addedText = detectedType === 'book' ? 'книгу' : 'фильм';
            const finalTitle = cleanTitle || title;

            console.log(`Auto-switching from ${this.state.currentSection} to ${targetSection}`);

            // Переключаем раздел
            this.setState({
                currentSection: targetSection,
                selectedItemId: null,
                selectedItemTitle: null
            }, () => {
                // Сохраняем в localStorage
                localStorage.setItem('media_tracker_current_section', targetSection);

                // Делаем первую букву заглавной
                let capitalizedTitle = finalTitle;
                if (capitalizedTitle && capitalizedTitle.length > 0) {
                    capitalizedTitle = capitalizedTitle.charAt(0).toUpperCase() + capitalizedTitle.slice(1).toLowerCase();
                }

                const newItem = {
                    id: Math.random().toString(36).substring(7),
                    title: capitalizedTitle,
                    type: detectedType,
                    rating: 0,
                    review: '',
                    date: new Date().toISOString().split('T')[0],
                };

                // Добавляем в соответствующий массив
                const targetItems = targetSection === 'books' ? this.state.books : this.state.movies;
                const updatedItems = [...targetItems, newItem];
                const stateField = targetSection === 'books' ? 'books' : 'movies';
                const storageKey = targetSection === 'books' ? 'media_tracker_books' : 'media_tracker_movies';

                this.setState({ [stateField]: updatedItems }, () => {
                    localStorage.setItem(storageKey, JSON.stringify(updatedItems));
                    console.log(`Added ${addedText} "${capitalizedTitle}" to ${targetSectionName}`);

                    // Голосовой ответ
                    this._send_action_value('add_success', `Переключился в раздел ${targetSectionName} и добавил ${addedText} ${capitalizedTitle}`);

                    // Отправляем новое состояние ассистенту
                    if (this.assistant && this.assistant.sendState) {
                        const currentState = this.getStateForAssistant();
                        this.assistant.sendState(currentState);
                    }
                });
            });

            return; // Выходим, так как уже обработали
        }

        // Если тип не указан или соответствует текущему разделу - обычное добавление
        let finalTitle = cleanTitle || title;

        // Очистка от слов "книгу", "фильм" (если остались)
        if (finalTitle && typeof finalTitle === 'string') {
            finalTitle = finalTitle.replace(/^(книгу|фильм|книга|фильма?)\s+/i, '').trim();
        }

        // Делаем первую букву заглавной
        if (finalTitle && finalTitle.length > 0) {
            finalTitle = finalTitle.charAt(0).toUpperCase() + finalTitle.slice(1).toLowerCase();
        }

        const newItem = {
            id: Math.random().toString(36).substring(7),
            title: finalTitle,
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

        // Подсвечиваем выбранный элемент
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
        console.log('=== review_media START ===');
        console.log('action:', action);
        console.log('selectedId from state:', this.state.selectedItemId);
        console.log('id from action:', action.id);

        // Сначала пытаемся взять id из action, потом из state
        let selectedId = action.id || this.state.selectedItemId;

        console.log('Final selectedId:', selectedId);

        if (!selectedId) {
            console.log('ERROR: No item selected');
            this._send_action_value('error', 'Сначала выберите элемент');
            return;
        }

        let review = action.review;
        if (Array.isArray(review)) {
            review = review.join(' ');
        }

        console.log('Review text:', review);

        // Обновляем selectedItemId в state
        this.setState({ selectedItemId: selectedId });

        const currentItems = this.getCurrentItems();
        console.log('Current items before update:', currentItems);

        const updatedItems = currentItems.map((item) =>
            item.id === selectedId ? { ...item, review: review } : item
        );

        console.log('Updated items after map:', updatedItems);

        this.updateCurrentItems(updatedItems);
        console.log('=== review_media END ===');
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
        try {
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
                        selectedItemId={this.state.selectedItemId}
                        onAdd={(title, mediaType) => {
                            this.add_media({ type: 'add_media', title, mediaType });
                        }}
                        onSelectItem={(item) => {
                            console.log('Manual select item:', item);
                            this.select_item({ type: 'select_item', id: item.id, title: item.title });
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
        } catch (error) {
            console.error('RENDER ERROR:', error);
            // Показываем ошибку на экране (тестировщик увидит)
            return (
                <div style={{
                    padding: '20px',
                    color: 'red',
                    fontFamily: 'monospace',
                    backgroundColor: '#ffeeee',
                    minHeight: '100vh'
                }}>
                    <h2>Ошибка в приложении</h2>
                    <p><strong>{error.message}</strong></p>
                    <details>
                        <summary>Подробности</summary>
                        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                            {error.stack}
                        </pre>
                    </details>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#1a5d2e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        🗑️ Очистить данные и перезагрузить
                    </button>
                    <button
                        onClick={() => {
                            this.setState({ currentSection: null });
                        }}
                        style={{
                            marginTop: '20px',
                            marginLeft: '10px',
                            padding: '10px 20px',
                            backgroundColor: '#666',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        ⬅️ На главный экран
                    </button>
                </div>
            );
        }
        
    }
}