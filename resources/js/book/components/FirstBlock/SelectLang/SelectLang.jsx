import React from "react";
import "./SelectLang.css";
import eventBus from "../../../../eventBus";
import i18n from "i18next";

function SelectLang() {
  const onChange = (e) => {
    i18n.changeLanguage(e.target.value).then(() => {
      localStorage.setItem('langChanged','1')
      eventBus.dispatch("langChanged")
    })
  }
  return (
    <div className="select-lang">
      <select className="select" onChange={onChange} defaultValue={localStorage.getItem('i18nextLng')}>
        {window.langs.map((el,key) => {
          return <option key={key} value={el.lang}>{el.title}</option>
        })}
      </select>
    </div>
  );
}

export default SelectLang;
