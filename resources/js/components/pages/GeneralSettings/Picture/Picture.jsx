import React from 'react';
import PictureBreadcrumbs from './PictureBreadcrumbs';
import PictureUploadButtons from './PictureUpload';
import DeleteButtons from './PictureDelete';
import PictureList from './PictureList';
import PictureList2 from './PictureList2';

export const  Picture = () => {
  return (
    <div className='pages__container'>
      <h1>Pictures</h1>
        <PictureBreadcrumbs />
        <PictureUploadButtons />
        <PictureList />
        <DeleteButtons />
        <PictureList2 />
        <DeleteButtons />
    </div>
  )
}

export default Picture ;