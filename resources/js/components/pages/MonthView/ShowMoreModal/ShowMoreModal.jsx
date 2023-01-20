import React from 'react'
import './ShowMoreModal.scss'

const ShowMoreModal = (props) => {
  const {
    data,
    active,
    setActive,
  } = props;

  return (
    <div
      className={active ? "modal active" : "modal"}
      onClick={() => setActive(false)}
    >
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        {data.map(i => (
          <div>{i.title}</div>
        ))}
      </div>
    </div>
  )
}

export default ShowMoreModal