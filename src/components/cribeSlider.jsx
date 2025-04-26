import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import '../styles/Slider.css';
import axios from '../axios';

export function CribeSlider() {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [sliderItems, setSliderItems] = useState([]);
    const [arrowIcons, setArrowIcons] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSliderData = async () => {
            try {
                const sliderRes = await axios.get('/slider');
                const iconsRes = await axios.get('/slider_icons');

                setSliderItems(sliderRes.data);

                if (iconsRes.data.length > 0) {
                    setArrowIcons({
                        left: iconsRes.data[0].left_arrow_icon,
                        right: iconsRes.data[0].right_arrow_icon
                    });
                }
            } catch (err) {
                setError(`Ошибка загрузки: ${err.message}`);
                console.error('Ошибка:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSliderData();
    }, []);

    if (loading) return <div className="slider-status">Загрузка...</div>;
    if (error) return <div className="slider-status error">{error}</div>;
    if (!sliderItems.length) return <div className="slider-status">Нет данных для отображения</div>;

    return (
        <div className='container'>
            <div className='row'>
                <div className="slider-container">
                    <Swiper
                        spaceBetween={10}
                        navigation={{
                            nextEl: '.custom-next',
                            prevEl: '.custom-prev',
                        }}
                        thumbs={{ swiper: thumbsSwiper }}
                        modules={[FreeMode, Navigation, Thumbs]}
                        className="main-swiper"
                    >
                        {sliderItems.map((item) => (
                            <SwiperSlide key={item.id}>
                                <img src={item.image} alt={`Slide ${item.id}`} />
                            </SwiperSlide>
                        ))}

                        {arrowIcons.left && (
                            <div className="custom-prev">
                                <img src={arrowIcons.left} alt="Previous" />
                            </div>
                        )}
                        {arrowIcons.right && (
                            <div className="custom-next">
                                <img src={arrowIcons.right} alt="Next" />
                            </div>
                        )}
                    </Swiper>

                    <Swiper
                        onSwiper={setThumbsSwiper}
                        spaceBetween={10}
                        slidesPerView={2}
                        freeMode={true}
                        watchSlidesProgress={true}
                        modules={[FreeMode, Thumbs]}
                        className="thumbs-swiper"
                    >
                        {sliderItems.map((item) => (
                            <SwiperSlide key={`thumb-${item.id}`}>
                                <img src={item.image} alt={`Thumb ${item.id}`} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>

        </div>

    );
}
