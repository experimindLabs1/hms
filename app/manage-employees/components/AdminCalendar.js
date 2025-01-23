'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminCalendar = ({ selected, onSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)));

  const daysInMonth = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 0)).getUTCDate();
  const firstDayOfMonth = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1)).getUTCDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const isDateSelected = (day) => {
    return selected && 
      selected.getUTCDate() === day &&
      selected.getUTCMonth() === currentMonth.getUTCMonth() &&
      selected.getUTCFullYear() === currentMonth.getUTCFullYear();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() - 1, 1)));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 1)));
  };

  const handleDateClick = (day) => {
    const newDate = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), day));
    onSelect(newDate);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {monthNames[currentMonth.getUTCMonth()]} {currentMonth.getUTCFullYear()}
        </h2>
        <Button variant="outline" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-sm font-medium text-gray-500 p-2">
            {day}
          </div>
        ))}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="h-10"></div>
        ))}
        {days.map((day) => (
          <button
            key={day}
            onClick={() => handleDateClick(day)}
            className={`
              h-10 w-10 rounded-full flex items-center justify-center text-sm
              transition-colors duration-200
              ${isDateSelected(day)
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'hover:bg-gray-100'
              }
              cursor-pointer
            `}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminCalendar; 