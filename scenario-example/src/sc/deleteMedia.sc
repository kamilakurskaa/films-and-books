theme: /

    state: УдалениеЭлемента
        q!: (~удалить|удали)
            $AnyText::anyText
        
        script:
            log('deleteMedia: context: ' + JSON.stringify($context))
            var item_id = get_id_by_selected_item(get_request($context));
            if (!item_id && $parseTree.anyText) {
                item_id = get_id_by_title(get_request($context), $parseTree.anyText);
            }
            if (item_id) {
                deleteMedia(item_id, $context);
            } else {
                log('deleteMedia: item not found');
            }
        
        a: Удалил