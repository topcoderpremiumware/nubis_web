import React, {useEffect, useState} from "react";
import "./HelloBlock.css";
import {useTranslation} from "react-i18next";
import axios from "axios";

function HelloBlock(props) {
  const { t } = useTranslation()
  const [logo, setLogo] = useState('')
  const [background, setBackground] = useState('/images/default_place_image.png')
  const [backgroundType, setBackgroundType] = useState('')

  useEffect(() => {
    getLogo()
    getBackgroundVideo()
  }, [])

  const changeType = () => {
    props.handleChangeItem();
    props.setBlockType("mainblock");
  }

  const getPlaceId = () => {
    let pathArray = window.location.pathname.split('/')
    return pathArray.length === 3 ? pathArray[2] : 0
  }

  const getLogo = () => {
    axios.get(`${process.env.MIX_API_URL}/api/files_purpose`, {
      params: {
        place_id: getPlaceId(),
        purpose: "online_booking_logo",
      },
    }).then((response) => {
      setLogo(response.data.url);
    }).catch((error) => {
      console.log("Restaurant Info error: ", error);
    });
  }

  const getBackground = () => {
    axios.get(`${process.env.MIX_API_URL}/api/files_purpose`, {
      params: {
        place_id: getPlaceId(),
        purpose: "online_booking_background",
      },
    }).then((response) => {
      if(response.data.url){
        setBackground(response.data.url)
        setBackgroundType('image')
      }else{
        getDefaultBackground()
      }

    }).catch((error) => {
      getDefaultBackground()
      console.log("Restaurant Info error: ", error);
    });
  }

  const getDefaultBackground = () => {
    axios.get(`${process.env.MIX_API_URL}/api/files_purpose`, {
      params: {
        place_id: getPlaceId(),
        purpose: "online_booking_picture",
      },
    }).then((response) => {
      if(response.data.url) setBackground(response.data.url);
      setBackgroundType('image')
    }).catch((error) => {
      console.log("Restaurant Info error: ", error);
    });
  }

  const getBackgroundVideo = () => {
    axios.get(`${process.env.MIX_API_URL}/api/settings`,{
      params: {
        place_id: getPlaceId(),
        name: 'online-booking-background-video'
      }
    }).then(response => {
      if(response.data.value){
        setBackground(response.data.value)
        setBackgroundType('video')
      }else{
        getBackground()
      }
    }).catch(error => {
      getBackground()
      console.log("Restaurant Info error: ", error);
    })
  }

  return (<div className="helloBlockWrapper">
    {background && <div className="helloBlockBackground">
      {backgroundType === 'video' ?
        <iframe
          src={`https://www.youtube.com/embed/${background}?autoplay=1&mute=1&playlist=${background}&controls=0&loop=1&showinfo=0&modestbranding=1&rel=0&cc_load_policy=0`}
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen>
        </iframe>
        :
        <img src={background} alt=""/>
      }
    </div>}
    {logo && <div className="helloBlockLogo">
      <img src={logo} alt=""/>
    </div>}
    <button
      className="button-main"
      onClick={changeType}
    >
      {t('Book now')}
    </button>
  </div>);
}

export default HelloBlock;
