import React from 'react'
import '../../App.css'
import './Form.css'
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

const schema = yup.object({
  firstName: yup.string().required(),
  age: yup.number().positive().integer().required(),
}).required();

const GiftForm = ({onSubmit, onBack}) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const handleSubmitForm = data => {
    onSubmit(data)
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)}>
      Form

      <div className="gift-btns-wrapper">
        <button type="button" className="gift-btn" onClick={onBack}>← Back</button>
        <button type="submit" className="gift-btn">Next →</button>
      </div>
    </form>
  )
}

export default GiftForm