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


patterns:
    $AnyText = $nonEmptyGarbage
    $AnyNumber = (1|2|3|4|5)
    $mediaType = (книг|фильм|сериал)

theme: /
    state: Start
        q!: $regex</start>
        # При запуске приложения с голоса прилетит сказанная фраза.
        # Если названме приложения отличается, то выполнится переход к состоянию Fallback, будет проиграно "Я не понимаю".
        # Обратите внимание, что если в названии приложения есть тире, их нужно заменить на пробелы ("my-canvas-test" -> "my canvas test")
        q!: (запусти | открой | вруби) media tracker
        a: Запускаю трекер книг и фильмов.

    state: Fallback
        event!: noMatch
        script:
            log('entryPoint: Fallback: context: ' + JSON.stringify($context))
            addSuggestions(["Добавить книгу", "Добавить фильм", "Оценить книгу"], $context);
        a: Я не понимаю. Скажите "добавь книгу Война и мир" или "оцени фильм на 5"

