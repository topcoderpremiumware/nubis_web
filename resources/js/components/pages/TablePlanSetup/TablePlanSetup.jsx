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
    textAlign: 'left',
    justifyContent: 'left'
  });

  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState({})
  const [selectedName, setSelectedName] = useState(t('Not selected'))
  const [nameError, setNameError] = useState([])

  useEffect(() => {
    getTableplans()
    eventBus.on("placeChanged", () => {
      getTableplans()
    })
  },[])

  const onChange = (e) => {
    if(e.target.name === 'name'){
      setSelectedName(e.target.value)
      setSelectedPlan(prev => ({...prev, name: e.target.value}))
    }
  }

  const getTableplans = (selectedId = null) => {
    axios.get(process.env.MIX_API_URL+'/api/places/'+localStorage.getItem('place_id')+'/tableplans',{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setPlans(response.data)
      let tempSelected
      if(selectedPlan.id || selectedId) tempSelected = response.data.find(el => {
        return el.id === selectedPlan.id || el.id === selectedId
      })
      if(tempSelected){
        setSelectedName(tempSelected.name)
        setSelectedPlan(tempSelected)
      }else{
        setSelectedName(t('Not selected'))
        setSelectedPlan(prev => ({}))
      }
    }).catch(error => {})
  }

  const selectPlan = (plan) => {
    setSelectedPlan(plan)
    setSelectedName(plan.name)
  }

  const changePlanData = (plan) => {
    setSelectedPlan(plan)
    savePlan()
  }

  const createNew = () => {
    setSelectedPlan({
      name: "",
      place_id: localStorage.getItem('place_id'),
      data: []
    })
    setSelectedName('')
  }

  const copySelected = () => {
    let plan = {...selectedPlan}
    delete plan.id
    plan.name = selectedName+' copy'
    setSelectedPlan({...plan})
    setSelectedName(selectedName+' copy')
  }

  const savePlan = () => {
    let url = process.env.MIX_API_URL+'/api/tableplans'
    if(selectedPlan.hasOwnProperty('id')){
      url = process.env.MIX_API_URL+'/api/tableplans/'+selectedPlan.id
    }

    axios.post(url, selectedPlan,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      getTableplans(response.data.id)
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
      if(window.confirm(t('Are you sure you want to delete this plan?'))){
        axios.delete(process.env.MIX_API_URL+'/api/tableplans/'+selectedPlan.id,{
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
  }

  return (
    <div className='pages__container'>
      <h2>{t('Table Plan Setup')} - {selectedName}</h2>
      <div className="container-fluid">
        <Stack spacing={2} sx={{mb:2}} direction="row">
          <Button variant="contained" type="button" onClick={createNew}>{t('New')}</Button>
          {selectedPlan.hasOwnProperty('id') && <Button variant="contained" type="button" onClick={copySelected}>{t('Copy')}</Button>}
          <Button variant="contained" type="button" color="success" onClick={savePlan}>{t('Save')}</Button>
          <Button variant="contained" type="button" color="error" onClick={deletePlan}>{t('Delete')}</Button>
        </Stack>
        <div className="row">
          <div className="col-lg-2">
            <div className="overflow-auto mb-3">
              <div className="mb-3 mt-3">
                <TextField label={t('Name')} size="small" fullWidth
                           type="text" id="name" name="name" value={selectedName}
                           onChange={onChange}
                           disabled={!selectedPlan.hasOwnProperty('name')}
                           error={nameError.length > 0}
                           helperText={
                             <>{nameError.map(el => {return t(el)})}</>
                           }/>
              </div>
              {plans.map((plan,key) => {
                return <PlanButton variant="text" key={key} fullWidth
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
      </div>
    </div>
  );
};
