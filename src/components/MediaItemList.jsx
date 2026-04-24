import React from "react";
import { MediaItem } from './MediaItem';
import "../App.css";

export const MediaItemList = (props) => {
    const { items, onDelete, onRate, onReview, onSelectItem, selectedItemId } = props;

    return (
        <ul className="notes">
            {items.map((item, index) => (
                <MediaItem
                    key={item.id}
                    item={item}
                    index={index}
                    isSelected={selectedItemId === item.id}
                    onSelectItem={onSelectItem}
                    onDelete={onDelete}
                    onRate={onRate}
                    onReview={onReview}
                />
            ))}
        </ul>
    );
};