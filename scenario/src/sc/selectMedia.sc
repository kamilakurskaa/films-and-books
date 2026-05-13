theme: /
    
    state: ВыборЭлемента
        q!: (выбери|выдели|покажи) [$AnyText::itemName]
        
        script:
            log('=== selectMedia START ===');
            log('parseTree: ' + JSON.stringify($parseTree));
            
            var items = get_items(get_request($context));
            var item_id = null;
            var item_title = null;
            var searchName = $parseTree._itemName;
            
            if (!searchName && $parseTree.itemName) {
                if (typeof $parseTree.itemName === 'string') {
                    searchName = $parseTree.itemName;
                } else if ($parseTree.itemName.text) {
                    searchName = $parseTree.itemName.text;
                } else if (Array.isArray($parseTree.itemName) && $parseTree.itemName[0]) {
                    searchName = $parseTree.itemName[0].text || $parseTree.itemName[0];
                }
            }
            
            log('Searching for: "' + searchName + '"');
            log('Available items: ' + JSON.stringify(items));
            
            if (searchName && items && items.length > 0) {
                var searchLower = searchName.toLowerCase().trim();
                var bestMatch = null;
                var bestMatchScore = 0;
                
                for (var i = 0; i < items.length; i++) {
                    var itemTitle = items[i].title.toLowerCase().trim();
                    var score = 0;
                    
                    // Точное совпадение
                    if (itemTitle === searchLower) {
                        score = 3;
                    }
                    // Начинается с искомого
                    else if (itemTitle.indexOf(searchLower) === 0) {
                        score = 2;
                    }
                    // Содержит искомое
                    else if (itemTitle.indexOf(searchLower) !== -1) {
                        score = 1;
                    }
                    // Искомое содержит название элемента
                    else if (searchLower.indexOf(itemTitle) !== -1) {
                        score = 1;
                    }
                    
                    if (score > bestMatchScore) {
                        bestMatchScore = score;
                        bestMatch = items[i];
                    }
                }
                
                if (bestMatch) {
                    item_id = bestMatch.id;
                    item_title = bestMatch.title;
                    log('MATCH found: ' + item_title + ' (score: ' + bestMatchScore + ')');
                }
            }
            
            if (item_id) {
                log('SUCCESS: selected ' + item_title);
                addAction({
                    type: "select_item",
                    id: item_id,
                    title: item_title
                }, $context);
            } else {
                log('ERROR: Item "' + searchName + '" not found');
                var currentSection = get_request($context).current_section;
                var sectionName = currentSection === 'books' ? 'книг' : 'фильмов';
                $reactions.answer("Не нашел " + searchName + " среди ваших " + sectionName);
                addSuggestions(["Добавь " + searchName], $context);
            }
            
        random:
            a: Выбрал
            a: Ок, выбрал
        