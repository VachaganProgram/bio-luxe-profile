import { Link } from "react-router-dom";
import { useState } from "react";

export function Popular_item({ item, addToBasket }) {
    const [isHeart, setIsHeart] = useState(false);

    const toggleSaved = (e) => {
        e.preventDefault();
        setIsHeart(!isHeart);
    };

    return (
        <Link className="box" to={'/'}>
            <img src={item.images[0]?.image} alt={item.title} />
            <div className="content">
                <h3 className="title">{item.title}</h3>
                <div className="price">{item.price}</div>
                <button className="btn_add_to_bag" onClick={(e) => { e.preventDefault();toggleSaved(item.id) }}>
                    {item.btn_text}
                </button>
            </div>
            <div className="heart_icon" onClick={toggleSaved}>
                <img
                    src={isHeart ? "../images/Black_heart.svg" : "../images/Heart.svg"}
                    alt="heart"
                />
            </div>
        </Link>
    );
}