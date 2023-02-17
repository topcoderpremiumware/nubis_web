import React, {Suspense, useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import './../i18nextConf';
import "./App.scss";

import LoadingPage from "../components/LoadingPage";
import axios from 'axios';
import { Rating } from '@mui/material';
import moment from 'moment';
import arrow from '../../assets/arrow.svg'
import bg from '../../assets/feedback-bg.jpg'
import ellipse from '../../assets/ellipse.png'
import plate from '../../assets/plate-1.png'

function App() {
  const [feedbacks, setFeedbacks] = useState([])
  const [activeId, setActiveId] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const getFeedbacks = async () => {
    try {
      setIsLoading(true)

      const response = await axios.get(`${process.env.MIX_API_URL}/api/feedbacks_public`,{
        params: {
          place_id: window.location.pathname.split('/')[2]
        },
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })

      setFeedbacks(response.data)
    } catch(err) {
      console.log('err', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getFeedbacks()
  }, [])

  return (
    <Suspense fallback={<LoadingPage/>}>
      <div className="feedback">
        <div className="feedback-hero" style={{backgroundImage: `url(${bg})`}}>
          <h1 className="feedback-title feedback-hero-title">Our Customers Love Us. Why?</h1>
          <p className="feedback-text">A review is a written or verbal evaluation of a product, service, or experience. It typically provides a detailed account of an individual's personal experience and their overall opinion of the product or service.</p>
        </div>
        <div className="feedback-main">
          <img src={ellipse} alt="ellipse" className='feedback-ellipse-1' />
          <img src={ellipse} alt="ellipse" className='feedback-ellipse-2' />
          <img src={plate} alt="plate" className='feedback-plate' />
          <h2 className="feedback-title">Our Customers Love Us. Why?</h2>
          {feedbacks.length > 0 && feedbacks.map(i => (
            <div
              key={i.id}
              className={activeId === i.id
                ? "feedback-item feedback-item-active"
                : "feedback-item"
              }
            >
              <div className="feedback-item-top">
                <Rating
                  value={i.average_mark}
                  precision={0.5}
                  readOnly
                  size="small"
                />
                {moment(i.created_at).format('DD/MM/YYYY')}
              </div>
              <div className="feedback-item-name">{i.customer.first_name} {i.customer.last_name}</div>
              <p className="feedback-item-text">{i.comment || '-'}</p>

              <div
                className="feedback-item-arrow"
                onClick={() => setActiveId(activeId === i.id ? 0 : i.id)}
              >
                <img src={arrow} alt="Arrow Icon" />
              </div>

              <div className="feedback-item-detail">
                <div className="feedback-item-subtitle">Ratings</div>
                <div className="feedback-item-wrapper">
                  Food:
                  <Rating
                    value={i.food_mark}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                </div>
                <div className="feedback-item-wrapper">
                  Service:
                  <Rating
                    value={i.service_mark}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                </div>
                <div className="feedback-item-wrapper">
                  Ambiance:
                  <Rating
                    value={i.ambiance_mark}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                </div>
                <div className="feedback-item-wrapper">
                  Overall experience:
                  <Rating
                    value={i.experience_mark}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                </div>
                <div className="feedback-item-wrapper">
                  Value for money:
                  <Rating
                    value={i.price_mark}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                </div>
                <div className="feedback-item-wrapper">
                  Total Average Rating:
                  <Rating
                    value={i.average_mark}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                </div>
                <div className="feedback-item-wrapper">
                  Would recommend:
                  <span>{i.is_recommend ? 'Yes' : 'No'}</span>
                </div>
                <div className="feedback-item-wrapper">
                  Reviewed:
                  <span>{moment(i.created_at).format('DD/MM/YYYY')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Suspense>
  );
}

export default App;

if (document.getElementById('app')) {
  ReactDOM.render(<App />, document.getElementById('app'));
}
