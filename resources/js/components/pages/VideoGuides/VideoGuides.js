import React, { useEffect, useState } from 'react'
import './VideoGuides.scss'
import axios from 'axios';
import plate1 from '../../../../assets/plate-1.png'
import plate2 from '../../../../assets/plate-2.png'
import plate3 from '../../../../assets/plate-3.png'
import { useTranslation } from 'react-i18next';

const VideoGuides = () => {
  const { t, i18n } = useTranslation();

  const [guides, setGuides] = useState([])

  const getGuide = async () => {
    axios.get(process.env.MIX_API_URL+'/api/video_guides', {
      params: {
        language: i18n.language
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
    .then(response => {
      setGuides(response.data)
    })
    .catch(error => {})
  }

  useEffect(() => {
    getGuide()
  }, [i18n.language])

  return (
    <div className="guide">
      <img src={plate1} alt="Picture" className="guide-img-1" />
      <img src={plate2} alt="Picture" className="guide-img-2" />
      <img src={plate3} alt="Picture" className="guide-img-3" />

      <div className="guide-container">
        <h1 className="guide-title">{t('How to Use our System ?')}</h1>

        {guides.length > 0 && guides.map(i => (
          <div key={i.id} className="guide-item">
            <div className="guide-item-wrapper">
              <h3 className="guide-item-title">{i.title}</h3>
              <p className="guide-item-text">{i.description}</p>
              <a href={i.page_url} target="_blank" className="guide-item-link">{t('Try it Now')}</a>
            </div>
            <iframe
              width="606"
              height="339"
              src={`https://www.youtube.com/embed/${i.youtube_id}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default VideoGuides
