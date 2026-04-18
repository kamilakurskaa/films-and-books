theme: /
    
    state: ОтзывЭлемента
        q!: (напиши отзыв|оставь отзыв|добавь рецензию) 
            (на|о|про) 
            [$AnyText::itemName] 
            [$AnyText::review]
            
        q!: (отзыв|рецензия) 
            [$AnyText::review]
            
        script:
            log('reviewMedia: context: ' + JSON.stringify($context))
            var item_id = get_id_by_selected_item(get_request($context));
            var review = $parseTree.review;
            
            if (!item_id && $parseTree.itemName) {
                item_id = get_id_by_title(get_request($context), $parseTree.itemName);
            }
            
            if (item_id && review) {
                reviewMedia(item_id, review, $context);
                addSuggestions(["Оцени эту книгу", "Добавь ещё книгу"], $context);
            } else {
                log('reviewMedia: missing item_id or review');
            }
            
        random:
            a: Отзыв сохранён!
            a: Спасибо за отзыв!
            a: Запомнил!
        