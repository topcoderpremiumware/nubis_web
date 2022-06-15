import React, {useEffect, useState} from "react";
import  './TablePlanSetup.scss';
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import PlanCanvas from "./PlanCanvas";
import PlanTools from "./PlanTools";
import {Button, Stack, styled, TextField} from "@mui/material";

export default function TablePlanSetup() {
  const { t } = useTranslation();

  const PlanButton = styled(Button)({
    color: '#000000',
    textTransform: 'none',
    textAlign: 'left'
  });

  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState({})
  const [selectedName, setSelectedName] = useState(t('Not selected'))
  const [nameError, setNameError] = useState([])

  useEffect(() => {
    getTableplans()
  },[])

  const onChange = (e) => {
    if(e.target.name === 'name'){
      setSelectedName(e.target.value)
      setSelectedPlan(prev => ({...prev, name: e.target.value}))
    }
  }

  const getTableplans = () => {
    axios.get(process.env.APP_URL+'api/places/'+localStorage.getItem('place_id')+'/tableplans',{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setPlans(response.data)
      setSelectedName(t('Not selected'))
      setSelectedPlan({})
    }).catch(error => {})
  }

  const selectPlan = (plan) => {
    setSelectedPlan(plan)
    setSelectedName(plan.name)
  }

  const changePlanData = (plan) => {
    console.log('PARENT change',plan)
    setSelectedPlan(prev => ({...plan}))
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
      getTableplans()
      eventBus.dispatch("notification", {type: 'success', message: 'Table plan saved successfully'});
    }).catch(error => {
      if (error.response && error.response.data && error.response.data.errors) {
        for (const [key, value] of Object.entries(error.response.data.errors)) {
          eventBus.dispatch("notification", {type: 'error', message: value});
        }
      } else if (error.response.status === 401) {
        eventBus.dispatch("notification", {type: 'error', message: 'Authorization error'});
      } else {
        eventBus.dispatch("notification", {type: 'error', message: error.message});
        console.log('Error', error.message)
      }
    })
  }

  const deletePlan = () => {
    if(selectedPlan.hasOwnProperty('id')){
      axios.delete(process.env.APP_URL+'/api/tableplans/'+selectedPlan.id,{
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        getTableplans()
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
              <div className="mb-3 mt-3">
                <TextField label={t('Name')} size="small" fullWidth
                           type="text" id="name" name="name" value={selectedName}
                           onChange={onChange}
                           error={nameError.length > 0}
                           helperText={
                             <>{nameError.map(el => {return t(el)})}</>
                           }/>
              </div>
              {plans.map((plan,key) => {
                return <PlanButton variant="text" key={key}
                               onClick={(e) => {selectPlan(plan)}}>{plan.name}</PlanButton>
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

        <Stack spacing={2} direction="row">
          <Button variant="contained" type="button" onClick={createNew}>{t('New')}</Button>
          <Button variant="contained" type="button" color="success" onClick={savePlan}>{t('Save')}</Button>
          <Button variant="contained" type="button" color="error" onClick={deletePlan}>{t('Delete')}</Button>
        </Stack>
      </div>
    </div>
  );
};
