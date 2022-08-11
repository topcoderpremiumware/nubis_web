import React, { useState, useEffect } from "react";
import "./Image.css";

function Image() {
  const getPlaceId = () => {
    let pathArray = window.location.pathname.split('/')
    return pathArray.length === 3 ? pathArray[2] : 0
  };

  const [mainImage, setMainImage] = useState(null);

  const getImage = () => {
    axios.get(`${process.env.APP_URL}/api/files_purpose`, {
        params: {
          place_id: getPlaceId(),
          purpose: "online_booking_picture",
        },
      })
      .then((response) => {
        setMainImage(response.data.url);
      })
      .catch((error) => {
        console.log("Restaurant Info error: ", error);
      });
  };

  useEffect(() => {
    getImage();
  }, []);

  return (
    <div className="main-image_picture">
      <img className="main-image" src={mainImage} alt="" />
    </div>
  );
}

export default Image;
