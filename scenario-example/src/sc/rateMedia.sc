theme: /

    state: ОценкаЭлемента
        q!: (оцени|поставь оценку|отметь) 
            [$AnyText::itemName] 
            (на|) 
            [$AnyNumber::rating]

        q!: (оцени|поставь оценку) 
            [$AnyText::itemName] 
            (на|) 
            (пять|четыре|три|два|один) [$AnyNumber::rating]
            
        script:
            log('rateMedia: context: ' + JSON.stringify($context))
            var item_id = get_id_by_selected_item(get_request($context));
            if (!item_id && $parseTree.itemName) {
                item_id = get_id_by_title(get_request($context), $parseTree.itemName);
            }
            var rating = parseInt($parseTree.rating);
            if (rating && rating >= 1 && rating <= 5) {
                rateMedia(item_id, rating, $context);
            } else {
                log('rateMedia: invalid rating');
            }

            
        random: 
            a: Оценка поставлена!
            a: Запомнил!
            
        