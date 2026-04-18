import React from 'react';
import { createAssistant, createSmartappDebugger } from '@salutejs/client';

import './App.css';
import { MediaList } from './pages/MediaList';

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
      const savedData = this.loadFromStorage();
      const savedSelectedId = localStorage.getItem('media_tracker_selected_id');
      const savedSelectedTitle = localStorage.getItem('media_tracker_selected_title');

      this.state = {
          selectedItemId: savedSelectedId || null,
          selectedItemTitle: savedSelectedTitle || null,
          items: savedData.length > 0 ? savedData : [
            {
                id: '1',
                title: 'Война и мир',
                type: 'book',
                rating: 5,
                review: 'Шедевр',
                date: '2026-01-15'
            },
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

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('media_tracker_items');
            if (saved) {
                const items = JSON.parse(saved);
                console.log('Loaded from storage:', items.length, 'items');
                return items;
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
        }
        return [];
    }

    // Сохранение данных в localStorage
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
    }

  clear_all_items = () => {
        console.log('clear_all_items');
        this.updateItemsAndSave([]);
        this._send_action_value('clear_all', 'Все элементы удалены');
  }

  componentDidMount() {
    console.log('componentDidMount');
  }

  getStateForAssistant() {
      console.log('getStateForAssistant: this.state:', this.state);

      // Находим индекс выбранного элемента
      let selectedIndex = -1;
      if (this.state.selectedItemId) {
          selectedIndex = this.state.items.findIndex(item => item.id === this.state.selectedItemId);
          console.log('Selected item index:', selectedIndex, 'for id:', this.state.selectedItemId);
      }

      const state = {
          active_item_id: this.state.selectedItemId,
          selected_item: selectedIndex >= 0 ? {
              index: selectedIndex,
              id: this.state.selectedItemId,
              title: this.state.selectedItemTitle
          } : null,
          item_selector: {
              items: this.state.items.map(({ id, title, type, rating }, index) => ({
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
      let fullText = action.title;
      let type = 'book';
      let title = fullText
      console.log('FullText:', fullText);

      if (fullText && typeof fullText === 'string') {
          // Убираем слово "книгу" или "книга" (с учётом пробелов)
          if (fullText.match(/книгу\s+/i)) {
              type = 'book';
              title = fullText.replace(/книгу\s+/i, '').trim();
              console.log('Detected and removed "книгу"');
          }
          // Убираем слово "фильм"
          else if (fullText.match(/фильм\s+/i)) {
              type = 'movie';
              title = fullText.replace(/фильм\s+/i, '').trim();
              console.log('Detected and removed "фильм"');
          }
          // Если слово в конце без пробела
          else if (fullText.endsWith('книгу')) {
              type = 'book';
              title = fullText.replace(/книгу$/i, '').trim();
          }
          else if (fullText.endsWith('фильм')) {
              type = 'movie';
              title = fullText.replace(/фильм$/i, '').trim();
          }
      }

      // Если после очистки title пустой
      if (!title || title === '') {
          title = action.title;
      }

      console.log('Final: title="' + title + '", type=' + type);

      const newItem = {
          id: Math.random().toString(36).substring(7),
          title: title,
          type: type,
          rating: 0,
          review: '',
          date: new Date().toISOString().split('T')[0],
      };

      this.updateItemsAndSave([...this.state.items, newItem]);
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
      this.updateItemsAndSave(this.state.items.filter(({ id }) => id !== action.id));
  }

   rate_media(action) {
       console.log('rate_media', action);
       if (action.id) {
           const updatedItems = this.state.items.map((item) =>
               item.id === action.id ? { ...item, rating: action.rating } : item
           );
           this.updateItemsAndSave(updatedItems);
    } 
    // Если есть itemName - ищем по названию
    else if (action.itemName) {
        let searchName = action.itemName;
        
        // Преобразуем в строку если нужно
        if (Array.isArray(searchName)) {
            searchName = searchName.join(' ');
        }
        if (typeof searchName === 'object') {
            searchName = searchName.text || searchName.value || String(searchName);
        }
        
        searchName = searchName.toLowerCase().trim();
        console.log('Searching for item by name:', searchName);
        
        let found = false;
        const updatedItems = this.state.items.map(item => {
            const itemTitle = item.title.toLowerCase().trim();
            
            // Точное совпадение или частичное
            if (itemTitle === searchName || itemTitle.includes(searchName) || searchName.includes(itemTitle)) {
                found = true;
                console.log(`Found: "${item.title}" -> setting rating to ${action.rating}`);
                return { ...item, rating: action.rating };
            }
            return item;
        });
        
        if (!found) {
            console.log(`Item "${searchName}" not found`);
            // Можно добавить уведомление
            this._send_action_value('item_not_found', `Не нашла "${searchName}"`);
        }
        
        this.updateItemsAndSave(updatedItems);
    }
    // Если нет ни id, ни itemName - пробуем найти по первому элементу
    else if (this.state.items.length > 0) {
        console.log('No identifier, rating first item');
        const updatedItems = [...this.state.items];
        updatedItems[0] = { ...updatedItems[0], rating: action.rating };
        this.updateItemsAndSave(updatedItems);
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

       console.log('Adding review to item:', selectedId, 'Review:', review);

       const updatedItems = this.state.items.map((item) =>
           item.id === selectedId ? { ...item, review: review } : item
       );
       this.updateItemsAndSave(updatedItems);
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
    console.log('render');
    return (
        <>
            <MediaList
                items={this.state.items}
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
        </>
    );
}
}