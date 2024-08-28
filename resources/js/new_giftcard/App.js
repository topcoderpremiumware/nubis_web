import React, {Suspense, useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import './../i18nextConf';
import "./App.scss";
import LoadingPage from "../components/LoadingPage";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import axios from 'axios';
import Alert from "../components/Notification/Alert";
import {simpleCatchError} from "../helper";
import {useTranslation} from "react-i18next";
import eventBus from "../eventBus";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import TypeSlide from "./pages/TypeSlide";
import ExperienceSlide from "./pages/ExperienceSlide";
import AmountQtySlide from "./pages/AmountQtySlide";
import ExperienceQtySlide from "./pages/ExperienceQtySlide";
import GreetingsSlide from "./pages/GreetingsSlide";
import DeliverySlide from "./pages/DeliverySlide";
import DeliveryFormSlide from "./pages/DeliveryFormSlide";
import SelectLang from "./components/SelectLang/SelectLang";
import moment from "moment";

function App() {
  const {t} = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0)
  const [giftcard, setGiftcard] = useState({expired_at: moment().add(3,'years').format('YYYY-MM-DD HH:mm:00')})
  const [place, setPlace] = useState({})
  const [pictures, setPictures] = useState([]);
  const [slideHistory, setSlideHistory] = useState([currentSlide]);
  const [paymentMethod, setPaymentMethod] = useState({})

  const slides = ['Option','Option','Option','Option','Customize','Delivery','Delivery']

  useEffect( () => {
    getPlace()
    getPictures()
    getPaymentMethod()
    eventBus.on('seeExample',(data) => {
      openPdf(data)
    })
  }, [])

  useEffect( () => {
    console.log('giftcard',giftcard)
  }, [giftcard])

  useEffect( () => {
    console.log('slideHistory',slideHistory)
  }, [slideHistory])

  const onBack = () => {
    let temp = slideHistory
    if(temp.length > 1){
      temp.pop()
      let current = temp[temp.length-1]
      setCurrentSlide(prev => current)
      setSlideHistory(prev => [...temp])
    }
  }
  const goTo = (index) => {
    setCurrentSlide(prev => index)
    setSlideHistory(prev => [...prev,index])
  }

  const onChange = (e) => {
    if(e.target.name === 'type'){
      setGiftcard(prev => ({
        ...prev,
        type: e.target.value,
        experience: null,
        experience_id: null,
        background_image: null,
        background_image_index: null
      }))
      if(e.target.value === 'amount'){
        goTo(1)
      }else{
        goTo(2)
      }
    }
    if(e.target.name === 'experience'){
      setGiftcard(prev => ({
        ...prev,
        experience: e.target.value,
        experience_id: e.target.value.id,
        amount: e.target.value.price,
        initial_amount: e.target.value.price
      }))
      goTo(3)
    }
    if(e.target.name === 'amount' && (parseFloat(e.target.value) > 0 || e.target.value === '')){
      setGiftcard(prev => ({...prev,
        amount: parseFloat(e.target.value),
        initial_amount: parseFloat(e.target.value)
      }))
    }
    if(e.target.name === 'quantity' && (parseFloat(e.target.value) > 0 || e.target.value === '')){
      setGiftcard(prev => ({...prev, quantity: parseFloat(e.target.value)}))
    }
    if(e.target.name === 'qty_together'){
      setGiftcard(prev => ({...prev, qty_together: e.target.checked}))
    }
    if(e.target.name === 'amount_finish'){
      if(giftcard.amount && giftcard.quantity){
        goTo(4)
      }else{
        eventBus.dispatch("notification", {type: 'error', message: 'Amount and quantity are not set'});
      }
    }
    if(e.target.name === 'experience_finish'){
      if(giftcard.quantity){
        goTo(4)
      }else{
        eventBus.dispatch("notification", {type: 'error', message: 'Quantity is not set'});
      }
    }
    if(e.target.name === 'background_image') setGiftcard(prev => ({...prev, background_image: e.target.value,background_image_index: e.target.index}))
    if(e.target.name === 'greetings') setGiftcard(prev => ({...prev, greetings: e.target.value}))
    if(e.target.name === 'greetings_finish'){
      if(giftcard.background_image){
        goTo(5)
      }else{
        eventBus.dispatch("notification", {type: 'error', message: 'Image is not set'});
      }
    }
    if(e.target.name === 'receiver'){
      setGiftcard(prev => ({...prev, receiver: e.target.value}))
      goTo(6)
    }
    if(e.target.name === 'name') setGiftcard(prev => ({...prev, name: e.target.value}))
    if(e.target.name === 'email') setGiftcard(prev => ({...prev, email: e.target.value}))
    if(e.target.name === 'company_name') setGiftcard(prev => ({...prev, company_name: e.target.value}))
    if(e.target.name === 'company_address') setGiftcard(prev => ({...prev, company_address: e.target.value}))
    if(e.target.name === 'post_code') setGiftcard(prev => ({...prev, post_code: e.target.value}))
    if(e.target.name === 'company_city') setGiftcard(prev => ({...prev, company_city: e.target.value}))
    if(e.target.name === 'country_id') setGiftcard(prev => ({...prev, country_id: e.target.value}))
    if(e.target.name === 'vat_number') setGiftcard(prev => ({...prev, vat_number: e.target.value}))
    if(e.target.name === 'separately' && !e.target.checked){
        setGiftcard(prev => ({...prev,
          receiver_name: [giftcard.receiver_name?.[0]],
          receiver_email: [giftcard.receiver_email?.[0]]
        }))
    }
    if(e.target.name === 'receiver_name'){
      let receiver_name = giftcard.receiver_name || []
      receiver_name[e.target.index] = e.target.value
      setGiftcard(prev => ({...prev, receiver_name: receiver_name}))
    }
    if(e.target.name === 'receiver_email'){
      let receiver_email = giftcard.receiver_email || []
      receiver_email[e.target.index] = e.target.value
      setGiftcard(prev => ({...prev, receiver_email: receiver_email}))
    }
    if(e.target.name === 'delivery_form_finish'){
      if(giftcard.name && giftcard.email){
        onCreate()
      }else{
        eventBus.dispatch("notification", {type: 'error', message: 'Name and email are not set'});
      }
    }
  }

  const getPlaceId = () => {
    let pathArray = window.location.pathname.split('/')
    return pathArray.length === 3 ? pathArray[2] : 0
  }

  const getPlace = () => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${getPlaceId()}`).then(response => {
      setPlace(response.data)
      setGiftcard(prev => ({...prev, place_id: response.data.id}))
    }).catch(error => {
    })
  }

  const getPictures = () => {
    axios.get(`${process.env.MIX_API_URL}/api/files_many_purposes`, {
      params: {
        place_id: getPlaceId(),
        purposes: ['giftcard_on_amount','giftcard_on_experience','giftcard_gallery'],
      },
    }).then((response) => {
      setPictures(response.data)
    }).catch((error) => {
      setPictures({})
    });
  }

  const getPaymentMethod = async () => {
    const res = await axios.get(`${process.env.MIX_API_URL}/api/places/${getPlaceId()}/payment_method`)
    setPaymentMethod(res.data)
  }

  const onCreate = async () => {
    await axios.post(`${process.env.MIX_API_URL}/api/giftcards`, giftcard, {
      headers: {
        // Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(res => {
      if(res.data?.payment_url) {
        window.location.href = res.data.payment_url
      }
    }).catch (error => {
      simpleCatchError(error)
    })
  }

  const openPdf = (data) => {
    axios.post(`${process.env.MIX_API_URL}/api/giftcard_pdf_preview`, data, {
      responseType: 'blob'
    }).then(response => {
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
        // const link = document.createElement('a');
        // link.href = pdfUrl;
        // link.setAttribute('download', 'example.pdf');
        // document.body.appendChild(link);
        // link.click();
      window.open(pdfUrl, '_blank');
      URL.revokeObjectURL(pdfUrl);
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  return (<>
    <Alert/>
    <SelectLang/>
    <div className="gift_content">
      <h1 className="gift_title">{t('Create your')} <span>{t('Gift Cart')}</span></h1>
      <div className="gift_subtitle">{t('Give indescribable pleasure to your loved ones in')}</div>
      <div className="place_name">{place.name}</div>
      <div className="breadcrumb">
        <div style={{cursor:'pointer'}} onClick={(e) => onBack()}><ChevronLeftIcon/> {t('Back')}</div>
        {['Option','Customize','Delivery','Payment'].map((item, index) => {
          return <div className={slides[currentSlide] === item ? 'active' : ''} key={index}>{index+1}. {t(item)}</div>
        })}
      </div>
      <Carousel
        selectedItem={currentSlide}
        swipeable={false}
        showArrows={false}
        showStatus={false}
        showIndicators={false}
        showThumbs={false}
        autoPlay={false}
        className="gift_carousel"
      >
        <div className="gift_wrapper">
          {pictures &&
            <TypeSlide pictures={pictures} onChange={onChange}/>}
        </div>
        <div className="gift_wrapper">
          <AmountQtySlide
            giftcard={giftcard}
            currency={paymentMethod['online-payment-currency']}
            onChange={onChange}/>
        </div>
        <div className="gift_wrapper">
          {place.hasOwnProperty('id') &&
            <ExperienceSlide
              place={place}
              currency={paymentMethod['online-payment-currency']}
              onChange={onChange}/>}
        </div>
        <div className="gift_wrapper">
          {giftcard.experience &&
            <ExperienceQtySlide
              place={place}
              giftcard={giftcard}
              currency={paymentMethod['online-payment-currency']}
              onChange={onChange}/>}
        </div>
        <div className="gift_wrapper">
          {(pictures.length > 0 && giftcard.quantity) &&
            <GreetingsSlide
              giftcard={giftcard}
              pictures={pictures}
              onChange={onChange}/>}
        </div>
        <div className="gift_wrapper">
          <DeliverySlide onChange={onChange}/>
        </div>
        <div className="gift_wrapper">
          <DeliveryFormSlide giftcard={giftcard} onChange={onChange}/>
        </div>
      </Carousel>
    </div>
    </>
  );
}

export default App;

if (document.getElementById('app')) {
  ReactDOM.render(<Suspense fallback={<LoadingPage/>}><App /></Suspense>, document.getElementById('app'));
}
