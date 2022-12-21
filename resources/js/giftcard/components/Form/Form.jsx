import React, { useState } from 'react'
import '../../App.css'
import './Form.css'
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { Autocomplete, Checkbox, FormControlLabel, TextField } from '@mui/material';
import countries from './countries'

const schema = yup.object({
  name: yup.string().required('This field is required'),
  email: yup.string().email('Invalid email').required('This field is required'),
}).required();

const receiverSchema = yup.object({
  receiver_name: yup.string().required('This field is required'),
  receiver_email: yup.string().email('Invalid email').required('This field is required'),
  name: yup.string().required('This field is required'),
  email: yup.string().email('Invalid email').required('This field is required'),
}).required();

const GiftForm = ({isReceiver, onSubmit, onBack}) => {
  const [isCompany, setIsCompany] = useState(false)
  const [companyId, setCompanyId] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(isReceiver ? receiverSchema : schema)
  });

  const handleSubmitForm = data => {
    onSubmit({...data, isCompany, companyId})
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)}>
      <div className="gift-form-wrapper">
        <div>
          <h3 className="gift-form-title">Your details</h3>
          <FormControlLabel 
            control={
              <Checkbox
                color="default"
                size="small"
                checked={isCompany}
                onChange={ev => setIsCompany(ev.target.checked)}
              />
            } 
            label="Company" 
            className="gift-form-check"
          />
          <label className="gift-form-label">
            <span>Name</span>
            <input 
              type="text"
              placeholder="Name"
              {...register("name")}
            />
            {errors?.name?.message && <span className="gift-form-err">{errors.name.message}</span>}
          </label>
          <label className="gift-form-label">
            <span>Email</span>
            <input 
              type="text"
              placeholder="Email"
              {...register("email")}
            />
            {errors?.email?.message && <span className="gift-form-err">{errors.email.message}</span>}
          </label>

          {isCompany &&
            <>
              <label className="gift-form-label">
                <span>Company Name</span>
                <input
                  type="text"
                  placeholder="Company Name"
                  {...register("company_name")}
                />
              </label>
              <label className="gift-form-label">
                <span>Company Address</span>
                <input
                  type="text"
                  placeholder="Company Address"
                  {...register("company_address")}
                />
              </label>
              <label className="gift-form-label">
                <span>Post Code</span>
                <input
                  type="text"
                  placeholder="Post Code"
                  {...register("post_code")}
                />
              </label>
              <label className="gift-form-label">
                <span>Company City</span>
                <input
                  type="text"
                  placeholder="Company City"
                  {...register("company_city")}
                />
              </label>
              <label className="gift-form-label">
                <span>VAT Number</span>
                <input
                  type="text"
                  placeholder="VAT Number"
                  {...register("vat_number")}
                />
              </label>
              <label className="gift-form-autocomplete-label">
                <span>Company Country</span>
                <Autocomplete
                  disablePortal
                  options={countries}
                  size="small"
                  onChange={(event, newValue) => {
                    setCompanyId(newValue.id)
                  }}
                  renderInput={(params) =>
                    <TextField
                      {...params}
                      displayEmpty
                      placeholder="Select country"
                    />
                  }
                />
              </label>
            </>
          }
        </div>

        {isReceiver &&
          <div>
            <h3 className="gift-form-title">Receiver</h3>

            <label className="gift-form-label">
              <span>Name</span>
              <input
                type="text"
                placeholder="Name"
                {...register("receiver_name")}
              />
              {errors?.receiver_name?.message && <span className="gift-form-err">{errors.receiver_name.message}</span>}
            </label>
            <label className="gift-form-label">
              <span>Email</span>
              <input
                type="text"
                placeholder="Email"
                {...register("receiver_email")}
              />
              {errors?.receiver_email?.message && <span className="gift-form-err">{errors.receiver_email.message}</span>}
            </label>
          </div>
        }
      </div>

      <div className="gift-btns-wrapper">
        <button type="button" className="gift-btn" onClick={onBack}>← Back</button>
        <button type="submit" className="gift-btn">Next →</button>
      </div>
    </form>
  )
}

export default GiftForm