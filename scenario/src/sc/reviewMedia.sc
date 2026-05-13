theme: /
    
    state: ОтзывЭлемента
        q!: (напиши отзыв|оставь отзыв|добавь рецензию) [$AnyText::review]
        
        q!: (отзыв|рецензия) [$AnyText::review]
            
        script:
            var review = $parseTree._review;
            if (Array.isArray(review)) {
                review = review.join(' ');
            }
            
            log('Review text: ' + review);
            
            if (review && review.length > 0) {
                addAction({
                    type: "review_media",
                    review: review
                }, $context);
            }
            
            
        random:
            a: Отзыв сохранён!
            a: Спасибо за отзыв!
            a: Запомнил!
        