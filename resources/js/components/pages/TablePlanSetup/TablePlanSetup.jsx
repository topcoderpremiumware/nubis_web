import React, {useEffect, useState} from "react";
import  './TablePlanSetup.scss';
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import PlanCanvas from "./PlanCanvas";
import PlanTools from "./PlanTools";

export default function TablePlanSetup() {
  const { t } = useTranslation();

  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState({})
  const [selectedName, setSelectedName] = useState(t('Not selected'))
  const [nameError, setNameError] = useState([])

  useEffect(() => {
    axios.get(process.env.APP_URL+'api/places/'+localStorage.getItem('place_id')+'/tableplans',{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setPlans(response.data)
    }).catch(error => {})
  },[])

  useEffect(() => {
    console.log('plan from parent',selectedPlan)
  },[selectedPlan])

  const onChange = (e) => {
    if(e.target.name === 'name') setSelectedName(e.target.value)
  }

  const selectPlan = (plan) => {
    setSelectedPlan(plan)
    setSelectedName(plan.name)
  }

  const changePlanData = (plan) => {

  }

  const createNew = () => {
    setSelectedPlan({
      name: "",
      place_id: localStorage.getItem('place_id'),
      data: []
    })
    setSelectedName('')
  }

  const savePlan = () => {
    let url = process.env.APP_URL+'/api/tableplans'
    if(selectedPlan.hasOwnProperty('id')){
      url = process.env.APP_URL+'/api/tableplans/'+selectedPlan.id
    }

    axios.post(url, selectedPlan,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Table plan saved successfully'});
    }).catch(error => {
      eventBus.dispatch("notification", {type: 'error', message: error.message});
      console.log('Error', error)
    })
  }

  const deletePlan = () => {
    if(selectedPlan.hasOwnProperty('id')){
      axios.delete(process.env.APP_URL+'/api/tableplans/'+selectedPlan.id,{
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        eventBus.dispatch("notification", {type: 'success', message: 'Table plan deleted successfully'});
      }).catch(error => {
        eventBus.dispatch("notification", {type: 'error', message: error.message});
        console.log('Error', error)
      })
    }
  }

  return (
    <div className='pages__container'>
      <h2>{t('Table Plan Setup')} - {selectedName}</h2>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-2">
            <div className="overflow-auto mb-3">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">{t('Name')}</label>
                <input onChange={onChange} required type="text" value={selectedName}
                       className={`form-control ${nameError.length > 0 ? 'is-invalid' : ''}`}
                       name="name" id="name"/>
                {nameError.length > 0 &&
                  <>{nameError.map(el => {return <div className="invalid-feedback">{t(el)}</div>})}</>
                }
              </div>
              {plans.map((plan,key) => {
                return <button key={key} type="button" onClick={(e) => {selectPlan(plan)}} className="btn btn-link mb-3">{plan.name}</button>
              })}
            </div>
          </div>
          <div className="col-lg-7">
            <div className="overflow-auto mb-3">
              <PlanCanvas onChange={changePlanData} data={selectedPlan}/>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="overflow-auto mb-3">
              <PlanTools onChange={changePlanData} data={selectedPlan} />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <button type="button" onClick={createNew} className="btn btn-primary me-3">{t('New')}</button>
            <button type="button" onClick={savePlan} className="btn btn-success me-3">{t('Save')}</button>
            <button type="button" onClick={deletePlan} className="btn btn-danger">{t('Delete')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};
