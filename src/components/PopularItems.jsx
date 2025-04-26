import { Popular_item } from "./PopularItem";
import axios from "../axios";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "../styles/popular_items.css";

export function Popular_items() {
    const [popular_items, setPopular_items] = useState([]);
    const [heading, setHeading] = useState("");
    const [arrows, setArrows] = useState({ left: "", right: "" }); 
    const [currentLanguage] = useState(localStorage.getItem("lang") || "en");
    const addToBasket = (item) => { console.log("Added to basket:", item); };

    useEffect(() => {
        const loadingData = async () => {
            try {
                const resHeading = await axios.get("liked_product_heading");
                const headingData = resHeading.data.find(item => item.lang === currentLanguage);
                setHeading(headingData.title);

                const resPopular_items = await axios.get("items?lang=" + currentLanguage);
                setPopular_items(resPopular_items.data || []);

                const resArrows = await axios.get("navigation_arrows");
                const leftArrow = resArrows.data.find(arrow => arrow.type === "left");
                const rightArrow = resArrows.data.find(arrow => arrow.type === "right");
                setArrows({
                    left: leftArrow?.image || "",
                    right: rightArrow?.image || ""
                });
            } catch (error) {
                console.log(error);
            }
        };

        loadingData();
    }, [currentLanguage]);

    const itemsFiltered = popular_items.filter(item => item.lang === currentLanguage).slice(0, 4);

    const itemsForSlider = [
        ...itemsFiltered,
        ...itemsFiltered,
        ...itemsFiltered
    ].slice(0, 12);

    return (
        <section id="popular_items">
            <div className="container">
                <div className="heading-wrapper">
                    <h2 className="heading">
                        <span>{heading}</span>
                        <div className="line"></div>
                    </h2>
                    <div className="navigation-arrows">
                        <div className="swiper-button-prev">
                            {arrows.left && <img src={arrows.left} alt="Previous" />}
                        </div>
                        <div className="swiper-button-next">
                            {arrows.right && <img src={arrows.right} alt="Next" />}
                        </div>
                    </div>
                </div>
                <Swiper
                    navigation={{
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    }}
                    modules={[Navigation]}
                    className="mySwiper"
                    slidesPerView={4}
                    slidesPerGroup={4} 
                    spaceBetween={20}
                    breakpoints={{
                        320: { slidesPerView: 1, slidesPerGroup: 1 },
                        640: { slidesPerView: 2, slidesPerGroup: 2 },
                        1024: { slidesPerView: 4, slidesPerGroup: 4 }
                    }}
                >
                    {itemsForSlider.map((item, index) => (
                        <SwiperSlide key={`${item.id}-${index}`}>
                            <Popular_item item={item} addToBasket={addToBasket} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}