theme: /

    state: ПереходВРаздел
        q!: (перейди в раздел|переключись в раздел|открой раздел|перейти в раздел) 
            [$AnyText::section]
            
        q!: (книги|фильмы)
            
        script:
            log('switchSection: context: ' + JSON.stringify($context))
            
            var sectionText = $parseTree._section;
            if (!sectionText && $parseTree.section) {
                sectionText = $parseTree.section;
            }
            
            var targetSection = null;
            var sectionLower = String(sectionText || $parseTree._text || '').toLowerCase();
            
            // Определяем целевой раздел
            if (sectionLower.indexOf('книг') !== -1 || sectionLower === 'книги') {
                targetSection = 'books';
            } else if (sectionLower.indexOf('фильм') !== -1 || sectionLower === 'фильмы') {
                targetSection = 'movies';
            }
            
            // Если пользователь просто сказал "Книги" или "Фильмы" без глагола
            if (!targetSection && $parseTree._text) {
                var text = String($parseTree._text).toLowerCase();
                if (text === 'книги') targetSection = 'books';
                if (text === 'фильмы') targetSection = 'movies';
            }
            
            if (targetSection) {
                addAction({
                    type: "switch_section",
                    section: targetSection
                }, $context);
                log('Switching to section: ' + targetSection);
            } else {
                log('Unknown section: ' + sectionText);
                $reactions.answer("Не понял, в какой раздел перейти. Скажите 'Книги' или 'Фильмы'");
            }
            
        random:
            a: Переключаюсь
            a: Открываю раздел
            a: Хорошо