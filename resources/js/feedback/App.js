import React, { Suspense, useState, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import './../i18nextConf';
import "./App.css";

import LoadingPage from "../components/LoadingPage";
import { FormControlLabel, Radio, RadioGroup, Rating } from '@mui/material';
import axios from 'axios';

function App() {
  const [feedback, setFeedback] = useState('')
  const [userId, setUserId] = useState(null)
  const [food, setFood] = useState(0)
  const [service, setService] = useState(0)
  const [ambiance, setAmbiance] = useState(0)
  const [experience, setExperience] = useState(0)
  const [price, setPrice] = useState(0)
  const [recommend, setRecommend] = useState(1)
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const onSubmit = async () => {
    try {
      setIsLoading(true)

      await axios.post(`${process.env.MIX_API_URL}/api/feedbacks`, {
        //customer_id: userId,
        //place_id: localStorage.getItem('place_id'),
        order_id: window.location.pathname.split('/')[2],
        comment,
        status: 'public',
        food_mark: food,
        service_mark: service,
        ambiance_mark: ambiance,
        experience_mark: experience,
        price_mark: price,
        is_recommend: Number(recommend)
      }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })

      setIsLoading(false)
      setIsSubmitted(true)
    } catch(err) {
      console.log('err', err)
      setIsLoading(false)
    }
  }

  const checkFeedback = () => {
    axios.post(`${process.env.MIX_API_URL}/api/feedbacks/is_exist`, {
      order_id: window.location.pathname.split('/')[2],
    }).then(res => {
      setFeedback(res.data.message)
    })
  }

  useLayoutEffect( () => {
    // if(!localStorage.getItem('token')){
    //   window.location.href="/"
    //   // axios.get(`${process.env.MIX_API_URL}/api/user`).then(response => {
    //   //   setUserId(response.data?.id)
    //   // }).catch(error => {
    //   //   if (error.response.status === 401){
    //   //     localStorage.clear()
    //   //     window.location.href="/"
    //   //   }
    //   // })
    // }
    checkFeedback()
  }, [])

  return (
    <Suspense fallback={<LoadingPage/>}>
      <div className="feedback-content">
        {localStorage.getItem('token') ?
          <>
            <h1 className="feedback-title">Feedback</h1>
            {feedback === "Feedback hasn't been created yet" ? (
              <>
                <p className="feedback-text">Please, tell us what you think about your recent visit at restaurant</p>
                {isSubmitted ? (
                  <h3 className="feedback-title feedback-success">Thank you!</h3>
                ) : (
                  <div className="feedback-wrapper">
                    <div className="feedback-item">
                      <span>Food:</span>
                      <Rating
                        value={food}
                        onChange={(event, newValue) => {
                          setFood(newValue);
                        }}
                      />
                    </div>
                    <div className="feedback-item">
                      <span>Service:</span>
                      <Rating
                        value={service}
                        onChange={(event, newValue) => {
                          setService(newValue);
                        }}
                      />
                    </div>
                    <div className="feedback-item">
                      <span>Ambiance:</span>
                      <Rating
                        value={ambiance}
                        onChange={(event, newValue) => {
                          setAmbiance(newValue);
                        }}
                      />
                    </div>
                    <div className="feedback-item">
                      <span>Overall experience:</span>
                      <Rating
                        value={experience}
                        onChange={(event, newValue) => {
                          setExperience(newValue);
                        }}
                      />
                    </div>
                    <div className="feedback-item">
                      <span>Value for money:</span>
                      <Rating
                        name="simple-controlled"
                        value={price}
                        onChange={(event, newValue) => {
                          setPrice(newValue);
                        }}
                      />
                    </div>
                    <div className="feedback-item">
                      <span>Would recommend:</span>
                        <RadioGroup
                          row
                          value={recommend}
                          onChange={ev => setRecommend(ev.target.value)}
                        >
                          <FormControlLabel value="1" control={<Radio color="default" size="small" />} label="Yes" />
                          <FormControlLabel value="0" control={<Radio color="default" size="small" />} label="No" />
                        </RadioGroup>
                    </div>
                    <div className="feedback-item feedback-item-column">
                      <span>Comment:</span>
                      <textarea
                        name="comment"
                        rows="3"
                        value={comment}
                        onChange={ev => setComment(ev.target.value)}
                      ></textarea>
                    </div>
                    <button className="feedback-btn" onClick={onSubmit} disabled={isLoading}>
                      {isLoading ? 'Loading...' : 'Submit'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="feedback-text">{feedback}</p>
            )}
          </>
          :
          null
        }
      </div>
    </Suspense>
  );
}

export default App;

if (document.getElementById('app')) {
  ReactDOM.render(<App />, document.getElementById('app'));
}
