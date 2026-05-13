theme: /

    state: УдалениеЭлемента
        q!: (~удалить|удали)
            $AnyText::anyText
        
        script:
            log('deleteMedia: context: ' + JSON.stringify($context))
            
            var searchText = $parseTree._anyText || $parseTree.anyText;
            
            // Если массив - берём первый элемент и его text (как в rateMedia)
            if (Array.isArray(searchText)) {
                if (searchText[0] && searchText[0].text) {
                    searchText = searchText[0].text;
                } else {
                    searchText = searchText.join(' ');
                }
            }
            
            // Если объект - берём поле text
            if (searchText && typeof searchText === 'object') {
                searchText = searchText.text || searchText.value || String(searchText);
            }
            
            log('Search text: "' + searchText + '"');
            
            // ОЧИСТКА: убираем слова "книгу", "фильм" и т.д. (как в rateMedia)
            if (searchText && typeof searchText === 'string') {
                var originalName = searchText;
                searchText = searchText.replace(/^(книгу|книга|книги|фильм|фильма|фильмы|сериал|сериала)\s+/i, '');
                searchText = searchText.trim();
                if (originalName !== searchText) {
                    log('Cleaned: "' + originalName + '" -> "' + searchText + '"');
                }
            }
            
            log('Cleaned search text: "' + searchText + '"');
            
            // ИЩЕМ ЭЛЕМЕНТ КАК В rateMedia
            var request = get_request($context);
            var items = get_items(request);
            var item_id = null;
            
            if (items && searchText && typeof searchText === 'string') {
                var searchName = searchText.toLowerCase().trim();
                for (var i = 0; i < items.length; i++) {
                    var itemTitle = items[i].title ? String(items[i].title).toLowerCase().trim() : '';
                    if (itemTitle === searchName || itemTitle.indexOf(searchName) !== -1) {
                        item_id = items[i].id;
                        log('Found item: ' + items[i].title + ' (id: ' + item_id + ')');
                        break;
                    }
                }
            }
            
            if (item_id) {
                addAction({
                    type: "delete_media",
                    id: item_id
                }, $context);
                log('deleteMedia: deleted item with id ' + item_id);
                $reactions.answer("Элемент удалён");
            } else {
                log('deleteMedia: item not found for search: "' + searchText + '"');
                $reactions.answer("Не могу найти элемент.");
                addSuggestions(["Добавить книгу", "Добавить фильм"], $context);
            }