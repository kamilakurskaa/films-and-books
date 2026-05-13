require: slotfilling/slotFilling.sc
  module = sys.zb-common
  
# Подключение javascript обработчиков
require: js/getters.js
require: js/reply.js
require: js/actions.js

# Подключение сценарных файлов
require: sc/addMedia.sc
require: sc/deleteMedia.sc
require: sc/rateMedia.sc
require: sc/reviewMedia.sc
require: sc/selectMedia.sc
require: sc/switchSection.sc


patterns:
    $Text = $nonEmptyGarbage
    $AnyText = $nonEmptyGarbage
    $AnyNumber = (1|2|3|4|5)
    $mediaType = (книг|фильм|сериал)

theme: /
    state: Start
        q!: $regex</start>
        q!: (запусти | открой | вруби) media tracker
        q!: (запусти | открой | вруби) Трекер книг и фильмов
        
        script:
            log('Hello state triggered');
            $context.startProcessed = true;

            var request = get_request($context);
            var currentSection = get_current_section(request);
            
            // Определяем, есть ли уже элементы
            var items = get_items(request);
            var hasItems = items && items.length > 0;
            
            // Персонализированное приветствие
            if (!currentSection) {
                // Пользователь ещё не выбрал раздел
                $reactions.answer("Добро пожаловать в Медиатеку! Я помогу вам вести коллекцию книг и фильмов. Скажите «Перейди в раздел книги» или «Перейди в раздел фильмы», чтобы начать.");
                addSuggestions(["Перейти в раздел книги", "Перейти в раздел фильмы"], $context);
            } 
    
    state: Help
        q!: (помощь)
    
        script:
            log('Help state triggered');
            
            var request = get_request($context);
            var currentSection = get_current_section(request);
            
            var helpText = "";
            var suggestionsList = [];
            
            if (!currentSection) {
                helpText = "Я умею: добавлять книги и фильмы, ставить оценки от 1 до 5, " +
                        "записывать отзывы, удалять элементы. " +
                        "Сначала выберите раздел: скажите «Перейди в раздел книги» или «Перейди в раздел фильмы». " +
                        "А потом можете добавлять: «Добавь книгу Война и мир».";
                suggestionsList = ["Перейти в раздел книги", "Перейти в раздел фильмы"];
            } else {
                var sectionName = currentSection === 'books' ? 'книг' : 'фильмов';
                var items = get_items(request);
                var hasItems = items && items.length > 0;
                
                helpText = "Я умею: добавлять " + sectionName + ", ставить оценки от 1 до 5, " +
                        "записывать отзывы, удалять элементы. " +
                        "Попробуйте сказать: «Добавь " + (currentSection === 'books' ? 'книгу' : 'фильм') + " Преступление и наказание», " +
                        "«Оцени Преступление и наказание на 5», «Выбери Преступление и наказание», «Напиши отзыв Очень понравилось» ";
            }
            
            $reactions.answer(helpText);
            addSuggestions(suggestionsList, $context);

    state: Fallback
        event!: noMatch
        script:
            log('Fallback: unknown command');
            var request = get_request($context);
            var currentSection = get_current_section(request);
            var items = get_items(request);

            if (!currentSection && (!items || items.length === 0)) {
                log('Start not processed yet, ignoring');
                return;
            }
            var response = "Я не понимаю эту команду. Скажите «добавь книгу» или «помощь».";
            if (currentSection === 'books') {
                response = "Я не понимаю эту команду. Скажите «добавь книгу».";
            } else if (currentSection === 'movies') {
                response = "Я не понимаю эту команду. Скажите «добавь фильм».";
            }
            $reactions.answer(response);

    

