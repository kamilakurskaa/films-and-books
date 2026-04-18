function addMedia(title, mediaType, context) {
    addAction({
        type: "add_media",
        title: title,
        mediaType: mediaType
    }, context);
}

function rateMedia(id, rating, context){
    addAction({
        type: "rate_media",
        id: id,
        rating: rating
    }, context);
}

function deleteMedia(id, context){
    addAction({
        type: "delete_media",
        id: id
    }, context);
}

function reviewMedia(id, review, context) {
    addAction({
        type: "review_media",
        id: id,
        review: review
    }, context);
}
