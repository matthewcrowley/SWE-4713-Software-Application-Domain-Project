import React, { useState } from 'react';
import './Calendar.css';

const Calendar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const selectDate = (day) => {
    if (day) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDate(newDate);
      setIsOpen(false);
    }
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!day) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const formatSelectedDate = () => {
    return selectedDate.toLocaleDateString('en-US', {
      year: '2-digit',
      month: '2-digit',
      day: 'numeric'
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);

  return (
    <div className="calendar-container">
      <button 
        className="calendar-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Click to open calendar"
      >
        📅 {formatSelectedDate()}
      </button>
      
      {isOpen && (
        <div className="calendar-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="calendar-header">
              <button 
                className="calendar-nav-btn"
                onClick={() => navigateMonth('prev')}
                title="Previous month"
              >
                ‹
              </button>
              <h3 className="calendar-month-year">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button 
                className="calendar-nav-btn"
                onClick={() => navigateMonth('next')}
                title="Next month"
              >
                ›
              </button>
            </div>
            
            <div className="calendar-grid">
              <div className="calendar-days-header">
                {days.map(day => (
                  <div key={day} className="calendar-day-header">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="calendar-days">
                {daysInMonth.map((day, index) => (
                  <button
                    key={index}
                    className={`calendar-day ${
                      !day ? 'calendar-day-empty' : ''
                    } ${
                      isToday(day) ? 'calendar-day-today' : ''
                    } ${
                      isSelected(day) ? 'calendar-day-selected' : ''
                    }`}
                    onClick={() => selectDate(day)}
                    disabled={!day}
                    title={day ? `Select ${months[currentDate.getMonth()]} ${day}, ${currentDate.getFullYear()}` : ''}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="calendar-footer">
              <button 
                className="calendar-today-btn"
                onClick={() => {
                  const today = new Date();
                  setCurrentDate(today);
                  setSelectedDate(today);
                  setIsOpen(false);
                }}
                title="Go to today's date"
              >
                Today
              </button>
              <button 
                className="calendar-close-btn"
                onClick={() => setIsOpen(false)}
                title="Close calendar"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
