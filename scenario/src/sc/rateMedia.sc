theme: /

    state: ОценкаЭлемента
        q!: (оцени книгу|оцени фильм|оцени|поставь оценку|отметь) 
            [$AnyText::itemName] 
            [на]
            [$AnyText::ratingText]
            
        script:
            var ratingText = $parseTree._ratingText || $parseTree.ratingText;
            
            // Если ratingText массив или объект
            if (Array.isArray(ratingText)) {
                ratingText = ratingText.join(' ');
            }
            if (ratingText && typeof ratingText === 'object') {
                ratingText = ratingText.text || ratingText.value || String(ratingText);
            }
            
            log('Rating text: "' + ratingText + '"');
            
            // Парсим рейтинг (убираем звёздочки)
            var ratingNum = 0;
            if (ratingText) {
                var cleanRating = String(ratingText).toLowerCase().replace(/\*/g, '');
                
                if (cleanRating === 'пять' || cleanRating === '5') ratingNum = 5;
                else if (cleanRating === 'четыре' || cleanRating === '4') ratingNum = 4;
                else if (cleanRating === 'три' || cleanRating === '3') ratingNum = 3;
                else if (cleanRating === 'два' || cleanRating === '2') ratingNum = 2;
                else if (cleanRating === 'один' || cleanRating === '1') ratingNum = 1;
                else {
                    var match = cleanRating.match(/(\d+)/);
                    if (match) ratingNum = parseInt(match[1]);
                }
            }
            
            log('Parsed rating: ' + ratingNum);
            
            // Получаем название элемента (пытаемся из разных полей)
            var itemName = $parseTree._itemName || $parseTree.itemName;
            
            // Если itemName не найден, пробуем взять остаток текста
            if (!itemName && $parseTree._Root) {
                var rootText = $parseTree._Root;
                // Убираем слова "оцени", "книгу", "фильм", "на" и цифры
                itemName = rootText.replace(/^(оцени|поставь оценку|отметь)\s+/i, '');
                itemName = itemName.replace(/\s+(книгу|книга|книги|фильм|фильма|фильмы)\s+/i, ' ');
                itemName = itemName.replace(/\s+на\s+\d+\s*$/i, '');
                itemName = itemName.trim();
                log('Extracted item name from root: "' + itemName + '"');
            }
            
            if (Array.isArray(itemName)) {
                itemName = itemName.join(' ');
            }
            if (itemName && typeof itemName === 'object') {
                itemName = itemName.text || itemName.value || String(itemName);
            }
            
            log('Item name: "' + itemName + '"');
            
            // ОЧИСТКА: убираем слова "книгу", "фильм", "книга", "фильма" и т.д.
            if (itemName && typeof itemName === 'string') {
                var originalName = itemName;
                itemName = itemName.replace(/^(книгу|книга|книги|фильм|фильма|фильмы)\s+/i, '');
                itemName = itemName.trim();
                if (originalName !== itemName) {
                    log('Cleaned item name: "' + originalName + '" -> "' + itemName + '"');
                }
            }
            
            log('Item name (cleaned): "' + itemName + '"');

            // Ищем элемент по названию
            var request = get_request($context);
            var items = get_items(request);
            var item_id = null;
            
            if (items && itemName && itemName.length > 0) {
                var searchName = String(itemName).toLowerCase().trim();
                
                // Точное совпадение
                for (var i = 0; i < items.length; i++) {
                    var itemTitle = items[i].title ? String(items[i].title).toLowerCase().trim() : '';
                    if (itemTitle === searchName) {
                        item_id = items[i].id;
                        log('Found exact match: ' + items[i].title);
                        break;
                    }
                }
                
                // Частичное совпадение
                if (!item_id) {
                    for (var i = 0; i < items.length; i++) {
                        var itemTitle = items[i].title ? String(items[i].title).toLowerCase().trim() : '';
                        if (itemTitle.indexOf(searchName) !== -1 || searchName.indexOf(itemTitle) !== -1) {
                            item_id = items[i].id;
                            log('Found partial match: ' + items[i].title);
                            break;
                        }
                    }
                }
            }
            
            if (item_id && ratingNum >= 1 && ratingNum <= 5) {
                addAction({
                    type: "rate_media",
                    id: item_id,
                    rating: ratingNum
                }, $context);
                log('Rating sent!');
                $reactions.answer("Оценка поставлена.");
            } else if(!item_id) {
                log('ERROR: Cannot find item: "' + itemName + '"');
                var sectionName = get_current_section(request) === 'books' ? 'книг' : 'фильмов';
                $reactions.answer("Не могу найти. Попробуйте сказать Оцени название книги или фильма на 5 или Добавить книгу");
                addSuggestions(["Добавить фильм", "Добавить книгу"], $context);
            } else {
                log('ERROR: Invalid rating: ' + ratingNum);
                $reactions.answer("Оценка должна быть от 1 до 5.");
            }
            
        