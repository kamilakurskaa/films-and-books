import React from 'react';
import { AddMedia } from '../components/AddMedia';
import { MediaItemList } from '../components/MediaItemList';
import '../App.css';

export const MediaList = (props) => {
    const { items, onAdd, onDelete, onRate, onReview, onClearAll, onSelectItem, selectedItemId } = props;

    return (
        <div className="container">
            <AddMedia onAdd={onAdd} />

            {/*{items.length > 0 && (
                <button className="clear-all-btn" onClick={onClearAll}>
                    🗑️
                </button>
            )}*/}

            <MediaItemList
                items={items}
                selectedItemId={selectedItemId}
                onSelectItem={onSelectItem}
                onDelete={onDelete}
                onRate={onRate}
                onReview={onReview}
            />
        </div>
    );
};