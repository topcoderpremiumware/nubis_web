import React from 'react'
import { useTranslation } from 'react-i18next';

const VideoGuides = () => {
  const { t } = useTranslation();

  return (
    <div className='pages__container'>
      <h2>{t('Video Guides')}</h2>
      <div className="container-fluid">
        <div className="row">
          <div className="mt-3">Video Guides</div>
          {/*<iframe width="560" height="315" src="https://www.youtube.com/embed/cRV0O0kIGJg" allow="" allowFullScreen></iframe>*/}
        </div>
      </div>
    </div>
  )
}

export default VideoGuides
