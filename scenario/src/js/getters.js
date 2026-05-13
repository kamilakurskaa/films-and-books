function get_request(context) {
    if (context && context.request)
        return context.request.rawRequest;
    return {}
}

function get_server_action(request){
    if (request &&
        request.payload && 
        request.payload.data &&
        request.payload.data.server_action){
            return request.payload.data.server_action;
        }
    return {};
}

function get_screen(request){
    if (request &&
        request.payload &&
        request.payload.meta &&
        request.payload.meta.current_app &&
        request.payload.meta.current_app.state){
        return request.payload.meta.current_app.state.screen;
    }
    return "";
}

function get_selected_item(request){
if (request &&
        request.payload &&
        request.payload.meta &&
        request.payload.meta.current_app &&
        request.payload.meta.current_app.state){
        return request.payload.selected_item;
    }
    return null;
}

function get_items(request){
if (request &&
        request.payload &&
        request.payload.meta &&
        request.payload.meta.current_app &&
        request.payload.meta.current_app.state &&
        request.payload.meta.current_app.state.item_selector){
        return request.payload.meta.current_app.state.item_selector.items;
    }
    return null;
}

function get_current_section(request){
    if (request &&
        request.payload &&
        request.payload.meta &&
        request.payload.meta.current_app &&
        request.payload.meta.current_app.state){
        return request.payload.meta.current_app.state.current_section;
    }
    return null;
}

function get_id_by_selected_item(request){
    var items = get_items(request);
    var selected_item = get_selected_item(request);
    if (selected_item && items) {
        log('get_id_by_selected_item(): selected_item: '+toPrettyString(selected_item))
        if (items[selected_item.index]) {
            return items[selected_item.index].id
        }
    }
    return null;
}
function get_id_by_title(request, title) {
    var items = get_items(request);
    if (!items || !title) return null;
    
    // Обработка случая, когда title - массив или объект
    var searchTitle = title;
    if (Array.isArray(searchTitle)) {
        searchTitle = searchTitle.join(' ');
    }
    if (typeof searchTitle === 'object') {
        searchTitle = searchTitle.text || searchTitle.value || String(searchTitle);
    }
    
    // Очистка от слов "книгу", "фильм" и т.д.
    if (typeof searchTitle === 'string') {
        searchTitle = searchTitle.replace(/^(книгу|книга|книги|фильм|фильма|фильмы|сериал|сериала)\s+/i, '');
        searchTitle = searchTitle.trim();
    }
    
    if (typeof searchTitle !== 'string') {
        log('get_id_by_title: title is not a string after conversion');
        return null;
    }
    
    var searchLower = searchTitle.toLowerCase().trim();
    
    for (var i = 0; i < items.length; i++) {
        var itemTitle = items[i].title ? String(items[i].title).toLowerCase().trim() : '';
        if (itemTitle === searchLower || itemTitle.indexOf(searchLower) !== -1) {
            return items[i].id;
        }
    }
    return null;
}
function get_item_by_title(request, title) {
    var items = get_items(request);
    if (items && title) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].title && items[i].title.toLowerCase() === title.toLowerCase()) {
                return items[i];
            }
        }
    }
    return null;
}

function find_item_by_title_partial(request, searchText) {
    var items = get_items(request);
    if (!items || !searchText) return null;
    
    // Обработка входных данных
    if (Array.isArray(searchText)) {
        searchText = searchText.join(' ');
    }
    if (typeof searchText === 'object') {
        searchText = searchText.text || searchText.value || String(searchText);
    }
    
    if (typeof searchText !== 'string') return null;
    
    // Очистка от слов-определителей
    searchText = searchText.replace(/^(книгу|книга|книги|фильм|фильма|фильмы|сериал|сериала)\s+/i, '');
    var searchLower = searchText.toLowerCase().trim();
    
    var bestMatch = null;
    var bestScore = 0;
    
    for (var i = 0; i < items.length; i++) {
        var itemTitle = items[i].title ? String(items[i].title).toLowerCase().trim() : '';
        var score = 0;
        
        if (itemTitle === searchLower) {
            score = 3;
        } else if (itemTitle.indexOf(searchLower) === 0) {
            score = 2;
        } else if (itemTitle.indexOf(searchLower) !== -1) {
            score = 1;
        } else if (searchLower.indexOf(itemTitle) !== -1 && itemTitle.length > 3) {
            score = 1;
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestMatch = items[i];
        }
    }
    
    return bestMatch;
}
