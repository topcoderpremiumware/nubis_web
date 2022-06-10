import React from 'react';
import './BasicInformation.scss';
import BasicBreadcrumbs from'./BasicBreadcrumbs';
import BasicMainInformation from'./BasicMainInformation';

export const BasicInformation = () => {
  return (
    <div className='pages__container'>
      <h1>Basic Information</h1>
      <BasicBreadcrumbs />
      <BasicMainInformation />
    </div>
  )
}

export default BasicInformation ;