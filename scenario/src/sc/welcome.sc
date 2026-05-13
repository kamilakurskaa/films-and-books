theme: /

    state: Приветствие
        q!: $hello
        
        script:
            log('Hello state triggered');
            var request = get_request($context);
            var currentSection = get_current_section(request);
            
            // Определяем, есть ли уже элементы
            var items = get_items(request);
            var hasItems = items && items.length > 0;
            
            // Персонализированное приветствие
            if (!currentSection) {
                // Пользователь ещё не выбрал раздел
                $reactions.answer("Добро пожаловать в Медиатеку! Я помогу вам вести коллекцию книг и фильмов. Скажите «Перейди в книги» или «Перейди в фильмы», чтобы начать.");
                addSuggestions(["Перейти в книги", "Перейти в фильмы"], $context);
            } 
        
        random:
            a: Добро пожаловать!
            a: Здравствуйте!