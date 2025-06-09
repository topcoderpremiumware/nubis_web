import {useTranslation} from "react-i18next";
import {Accordion, AccordionDetails, AccordionSummary, Divider, Drawer, Typography} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Counter from "../../FirstBlock/Counter/Counter";
import "./CoursesMenu.css";
import {useEffect, useState} from "react";
import eventBus from "../../../../eventBus";

export default function CoursesMenu(props) {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setCourses(window.courses)
    calcTotal(window.courses)
  },[window.courses])

  const changeCount = (v,cIndex,pIndex) => {
    let c = courses ?? []
    c[cIndex].products[pIndex].count = v
    setCourses(prev => [...c])
    calcTotal(c)
  }

  const calcTotal = (c) => {
    if(!c) return
    let count = 0;
    let t = []
    for (let i = 0; i < c.length; i++) {
      for (let j = 0; j < c[i].products.length; j++) {
        if(c[i].products[j].hasOwnProperty('count')) {
          count += c[i].products[j].count
          let index = t.findIndex(p => p.id === c[i].products[j].id)
          if(index === -1) {
            t.push({...c[i].products[j]})
          }else{
            t[index].count += c[i].products[j].count
          }
        }
      }
    }
    setTotalCount(count)
    setTotal(t)
  }

  const save = () => {
    if(totalCount > 0) {
      window.courses = courses
      props.setOpen(false)
    }else{
      eventBus.dispatch("notification", {type: 'error', message: 'At least one product must be selected.'});
    }
  }

  return (<Drawer open={props.open} anchor="right" PaperProps={{sx:{width: "360px", maxWidth: "100%", p:1}}}>
    <Typography fontSize="16px" fontWeight="600" lineHeight="24px" padding="18px 0">{t('Current order')}</Typography>
    <Divider orientation="vertical" flexItem sx={{mb:2}}/>
    {courses && courses.map((course, cIndex) => <Accordion key={cIndex} sx={{background: "#FAFBFC", border: "1px solid #F7F7F7", boxShadow: "none"}}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontSize="16px" fontWeight="600" lineHeight="24px">{course.name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {course.products.map((product,pIndex) =><div key={pIndex} className="course_product">
          {product.image_url ? <img className="image" src={product.image_url} alt={product.name} /> : <div className="image"></div>}
          <div className="course_description">
            <div className="title">{product.name}</div>
            <Counter value={product.count ?? 0} onChange={v => changeCount(v,cIndex,pIndex)} />
          </div>
        </div>)}
      </AccordionDetails>
    </Accordion>)}
    <div className="course_total">
      <div className="course_total_title">{t('Total')}</div>
      <Divider orientation="vertical" flexItem sx={{my:1}}/>
      <div className="course_total_line">
        <div className="course_total_line_title">{t('Name')}</div>
        <div className="course_total_line_title">{t('Quantity')}</div>
      </div>
      {total.map((tp,i) => <div key={i} className="course_total_line">
        <div>{tp.name}</div>
        <div>{tp.count}</div>
      </div>)}
      <button type="button" onClick={save}>{t('Confirm')}</button>
    </div>
  </Drawer>)
}
