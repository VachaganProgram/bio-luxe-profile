import { useState, useEffect, useRef } from "react";
import axios from "../axios";
import "../styles/product.css";

function DeliveryModal({ deliveryInfo, isOpen, onClose, currentLanguage }) {
  if (!isOpen) return null;

  const getLocalizedText = (textObj) => textObj?.[currentLanguage] || textObj?.en || "";

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.classList.contains("modal-backdrop") && onClose()}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <img src={deliveryInfo.modalCloseIcon} alt="Close" className="modal-close-icon" />
        </button>
        <div className="modal-header">
          <h2 className="modal-title">{getLocalizedText(deliveryInfo.modalTitle)}</h2>
        </div>
        <div className="modal-body">
          <p className="modal-paragraph">{getLocalizedText(deliveryInfo.paragraph1)}</p>
          <ul className="modal-list">
            {deliveryInfo.points1.map((point, index) => (
              <li key={`point1-${index}`}>{getLocalizedText(point)}</li>
            ))}
          </ul>
          <p className="modal-paragraph">{getLocalizedText(deliveryInfo.paragraph2)}</p>
          <h3 className="modal-sub-title">{getLocalizedText(deliveryInfo.expressDelivery.title)}</h3>
          <ul className="modal-list">
            {deliveryInfo.expressDelivery.points.map((point, index) => (
              <li key={`express-${index}`}>{getLocalizedText(point)}</li>
            ))}
          </ul>
          <h3 className="modal-sub-title">{getLocalizedText(deliveryInfo.moreDeliveryInfoTitle)}</h3>
          <p className="modal-paragraph">{getLocalizedText(deliveryInfo.paragraph3)}</p>
          <ul className="modal-list">
            {deliveryInfo.points2.map((point, index) => (
              <li key={`point2-${index}`}>{getLocalizedText(point)}</li>
            ))}
          </ul>
          <p className="modal-paragraph">{getLocalizedText(deliveryInfo.paragraph4)}</p>
          <h3 className="modal-sub-title">{getLocalizedText(deliveryInfo.additionalDelivery.title)}</h3>
          <ul className="modal-list">
            {deliveryInfo.additionalDelivery.points.map((point, index) => (
              <li key={`additional-${index}`}>{getLocalizedText(point)}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SizeSelector({
  sizes,
  selectedSize,
  setSelectedSize,
  isDropdownOpen,
  setIsDropdownOpen,
  dropdownRef,
  sizeGuideRef,
  sizeGuideArrow,
  sizeLabel,
  sizeGuideText,
  currentLanguage,
}) {
  const getLocalizedText = (textObj) => textObj?.[currentLanguage] || textObj?.en || "";

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleSizeSelect = (size) => {
    if (size.available) {
      setSelectedSize(size.value);
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="size-selector">
      <label className="size-label">
        {getLocalizedText(sizeLabel)}
        <div ref={sizeGuideRef} className="size-guide-wrapper" onClick={toggleDropdown}>
          <a href="#" className="size-guide" onClick={(e) => e.preventDefault()}>
            {getLocalizedText(sizeGuideText)}
          </a>
          <img
            src={sizeGuideArrow}
            alt="Arrow"
            className={`size-guide-arrow ${isDropdownOpen ? "open" : ""}`}
          />
        </div>
      </label>
      <div className="dropdown-wrapper">
        <div ref={dropdownRef} className={`dropdown-menu ${isDropdownOpen ? "open" : ""}`}>
          {sizes.map((size) => (
            <div
              key={size.value}
              className={`dropdown-item ${selectedSize === size.value ? "selected" : ""} ${
                !size.available ? "disabled" : ""
              }`}
              onClick={() => handleSizeSelect(size)}
            >
              {size.value} {!size.available && " - not available"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductPage() {
  const [product, setProduct] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [heartIcon, setHeartIcon] = useState("images/heart.png");
  const [addToBagText, setAddToBagText] = useState("ADD TO BAG");

  const currentLanguage = localStorage.getItem("lang") || "en";
  const dropdownRef = useRef(null);
  const sizeGuideRef = useRef(null);

  const getLocalizedText = (textObj) => textObj?.[currentLanguage] || textObj?.en || "";

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/product?lang=${currentLanguage}`);
        setProduct(response.data);
        setSelectedSize(response.data.sizes.find((size) => size.available)?.value || "47");
      } catch (error) {
        setError(`Error: ${error.message}`);
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProductData();
  }, [currentLanguage]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await axios.get("/favorites");
        const favoriteItem = response.data.find((item) => item.id === "1");
        if (favoriteItem) {
          setIsFavorited(favoriteItem.isFavorited);
          setHeartIcon(favoriteItem.isFavorited ? "images/blue_heart.png" : favoriteItem.heart_image);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };
    loadFavorites();
  }, []);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await axios.get(`/cart?lang=${currentLanguage}`);
        if (response.data.length > 0) {
          setAddToBagText(getLocalizedText(response.data[0].btn_text));
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };
    loadCart();
  }, [currentLanguage]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        sizeGuideRef.current &&
        !sizeGuideRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleAddToBag = async () => {
    if (!selectedSize) return console.log("Please select a size.");
    try {
      await axios.post("/cart", {
        id: Date.now(),
        productId: product.id,
        size: selectedSize,
        quantity: 1,
      });
      setAddToBagText(
        getLocalizedText({
          en: "ADDED TO BAG",
          ru: "ДОБАВЛЕНО В КОРЗИНУ",
          am: "Ավելացված է զամբյուղում",
        })
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const response = await axios.get("/favorites");
      const favorites = response.data;
      const favoriteItemIndex = favorites.findIndex((item) => item.id === "1");
      let updatedFavorites = [...favorites];

      if (favoriteItemIndex !== -1) {
        updatedFavorites[favoriteItemIndex].isFavorited = !updatedFavorites[favoriteItemIndex].isFavorited;
      } else {
        updatedFavorites.push({ id: "1", heart_image: "images/heart.png", isFavorited: true });
      }

      await axios.put("/favorites", updatedFavorites);
      const newIsFavorited = favoriteItemIndex !== -1 ? updatedFavorites[favoriteItemIndex].isFavorited : true;
      setIsFavorited(newIsFavorited);
      setHeartIcon(newIsFavorited ? "images/blue_heart.png" : "images/heart.png");
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  if (loading) return <div className="status">Loading...</div>;
  if (error) return <div className="status error">{error}</div>;
  if (!product) return <div className="status">No data available</div>;

  return (
    <div className="product-details">
      <div className="category">{getLocalizedText(product.category)}</div>
      <h1 className="product-title">{getLocalizedText(product.title)}</h1>
      <div className="price">{product.price}</div>
      <div className="product-actions">
        <SizeSelector
          sizes={product.sizes}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          dropdownRef={dropdownRef}
          sizeGuideRef={sizeGuideRef}
          sizeGuideArrow={product.sizeGuideArrow}
          sizeLabel={product.sizeLabel}
          sizeGuideText={product.sizeGuideText}
          currentLanguage={currentLanguage}
        />
        <div className="description-section">
          <h2 className="section-title">{getLocalizedText(product.descriptionDetailsTitle)}</h2>
          <p className="description">{getLocalizedText(product.description)}</p>
          <p className="detail">
            <span className="detail-label">{getLocalizedText(product.productNumberLabel)}</span>{" "}
            {product.productNumber}
          </p>
          <p className="detail">
            <span className="detail-label">{getLocalizedText(product.materialLabel)}</span>{" "}
            {getLocalizedText(product.material)}
          </p>
          <p className="detail">
            <span className="detail-label">{getLocalizedText(product.weightLabel)}</span>{" "}
            {getLocalizedText(product.weight)}
          </p>
        </div>
        <button className="delivery-info-button" onClick={() => setIsModalOpen(true)}>
          <img src={product.deliveryInfo.deliveryLinkIcon} alt="Info" className="delivery-icon" />
          {getLocalizedText(product.deliveryInfo.deliveryLinkText)}
        </button>
        <div className="button-group">
          <button className="add-to-bag" onClick={handleAddToBag}>
            {addToBagText}
          </button>
          <button className="favorite-button" onClick={handleToggleFavorite}>
            <img src={heartIcon} alt="Favorite" className="heart-icon" />
          </button>
        </div>
      </div>
      <DeliveryModal
        deliveryInfo={product.deliveryInfo}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}