import './ActivityPage.scss';
import {useTranslation} from "react-i18next";

export default function Activity()  {
  const { t } = useTranslation();

  return (
    <div className='pages__container'>
      <h2>Activity</h2>
    </div>
  )
}
