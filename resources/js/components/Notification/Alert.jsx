import React, {useEffect, useState} from "react";
import  './Alert.scss';
import { useTranslation } from 'react-i18next';
import eventBus from "./../../eventBus";

export default function Alert() {
  const { t } = useTranslation();
  const [errors, setErrors] = useState([])
  const [count, setCount] = useState(0)

  useEffect(() => {
    eventBus.on("notification", (data) => {
      let temp = errors
      temp.push(data)
      setErrors([...temp])
      setTimeout(()=>{
        removeMessage(temp.length-1)
      },3000)
    });
  },[])


  const removeMessage = (index) => {
    let temp = errors
    temp.splice(index, 1);
    setErrors([...temp])
  }
  const close = (e, index) => {
    e.preventDefault()
    removeMessage(index)
  }

  return (
    <div className="toast-container position-fixed end-0 p-3" style={{zIndex:1400}}>
      {errors.map((alert,key)=> {
        return (<div key={key}
                    className={`toast align-items-center show text-white ${alert.type === 'success' ? 'bg-success' : 'bg-danger'}`}
                    role="alert" aria-live="assertive" aria-atomic="true">
          <div className="d-flex">
            <div className="toast-body">{t(alert.message)}</div>
            <button type="button"
                    onClick={(e) => {close(e,key)}}
                    className="btn-close me-2 m-auto"
                    aria-label="Close"/>
          </div>
        </div>)
      })}
    </div>
  );
};
