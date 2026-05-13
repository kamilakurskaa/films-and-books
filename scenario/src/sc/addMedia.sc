theme: /

    state: ДобавлениеЭлемента
        q!: (добавь|добавить) 
            $AnyText::anyText

        script:

            log('addMedia: context: ' + JSON.stringify($context))
            
            var fullText = $parseTree._anyText;
        
            
            addMedia(fullText, "", $context);
            addSuggestions(["Перейди в раздел фильмы", "Перейди в раздел книги"], $context);
            
        random:
            a: Добавлено!
            a: Записал!
            a: Сохранил!