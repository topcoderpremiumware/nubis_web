import './WeekViewPage.scss';
import {useTranslation} from "react-i18next";

export default function WeekViewPage()  {
  const { t } = useTranslation();

  return (
    <div className='pages__container'>
      <h2>WeekView</h2>
    </div>
  )
}
