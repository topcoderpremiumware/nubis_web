import React, { useState, useEffect } from "react";
import "./Image.css";

function Image() {
  const getPlaceId = () => {
    let pathArray = window.location.pathname.split('/')
    return pathArray.length === 3 ? pathArray[2] : 0
  };

  const [mainImage, setMainImage] = useState(null);

  const getImage = () => {
    axios.get(`${process.env.MIX_API_URL}/api/files_purpose`, {
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
      <img className="main-image" 
      // src={mainImage}
        src={'https://images.unsplash.com/photo-1574410009028-ed14f6f17c4a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=876&q=80'}
       alt="" />
    </div>
  );
}

export default Image;
