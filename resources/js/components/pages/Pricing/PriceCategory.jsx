import React, { useEffect, useState } from 'react'
import {useTranslation} from "react-i18next";


export default function PriceCategory(props) {
  const { t } = useTranslation();

  return (
    <div className="price_category">
      {props.discount ? <div className="save">{t('Save')} -{props.discount}%</div> : null}
      {props.prev ? <div className="prev">{props.prev}</div> : null}
      {props.price ? <div className="price">{props.price}<span>/{t('month')}</span></div> : null}
      <hr/>
      {props.title ? <div className="title">{props.title}</div> : null}
      {props.subtitle ? <div className="subtitle">{props.subtitle}</div> : null}
      <ul className="description">
        {props.description && props.description.map((v,k) => {
          return <li key={k}>{v}</li>
        })}
      </ul>
      <button type="button" disabled={props.disabled} className="price_btn" onClick={props.onClick}>{t('Get started')}</button>
    </div>
  )
}
