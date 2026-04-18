theme: /

    state: ДобавлениеЭлемента
        q!: (добавь|добавить|запиши|поставь) 
            [$AnyText::mediaType] 
            [$AnyText::title]
            
        script:
            log('addMedia: context: ' + JSON.stringify($context))

            var mediaType = $parseTree.mediaType || "книгу";
            var title = $parseTree.title;
            
            // Определяем тип медиа
            var type = "book";
            if (mediaType.indexOf("фильм") !== -1 || mediaType.indexOf("кино") !== -1) {
                type = "movie";
            } else if (mediaType.indexOf("книг") !== -1 || mediaType.indexOf("роман") !== -1) {
                type = "book";
            } else if (mediaType.indexOf("сериал") !== -1) {
                type = "series";
            }

            addMedia(title, type, $context);
            addSuggestions(["Оцени эту книгу на 5", "Добавь фильм Интерстеллар"], $context);
            
        random:
            a: Добавлено!
            a: Записал!
            a: Сохранил!