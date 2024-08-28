import {useEffect} from "react";
import "./CalendarTooltip.css";

function CalendarTooltip(props) {

  useEffect(() => {
    const calendarCells = document.querySelectorAll(props.findSelector);

    const handleMouseEnter = (event) => {
      const hoveredElementPositionX = event.clientX;
      const hoveredElementPositionY = event.clientY;

      const calendarPopup = document.createElement('div');
      calendarPopup.classList.add("calendar_popup");
      calendarPopup.textContent = props.content;
      calendarPopup.style.top = `${hoveredElementPositionY}px`;
      calendarPopup.style.left = `${hoveredElementPositionX}px`;

      document.body.appendChild(calendarPopup);

      event.target.addEventListener('mouseleave', () => {
        if(document.body.contains(calendarPopup)){
          document.body.removeChild(calendarPopup);
        }
      });
    };

    calendarCells.forEach(element => {
      if(props.content){
        element.classList.add("calendar_info")
        element.addEventListener('mouseenter', handleMouseEnter);
      }
    });

    return () => {
      calendarCells.forEach(element => {
        element.removeEventListener('mouseenter', handleMouseEnter);
      });
    };
  }, [props]);

  return null;
}

export default CalendarTooltip;
