'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminCalendar = ({ selected, onSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(
    selected || new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  // Update currentMonth when selected date changes
  useEffect(() => {
    if (selected) {
      setCurrentMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
  }, [selected]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const isDateSelected = (day) => {
    return selected && 
      selected.getDate() === day &&
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelect(newDate);
  };

  return (
    <div className="p-4 h-max min-h-max">
      <div className="flex justify-between items-center mb-4">
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrevMonth}
            className="hover:bg-white/10 text-slate-600 dark:text-slate-400"
        >
            <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNextMonth}
            className="hover:bg-white/10 text-slate-600 dark:text-slate-400"
        >
            <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-sm font-medium text-slate-500 dark:text-slate-400 p-2">
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
              transition-all duration-200
              ${isDateSelected(day)
                ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-md'
                : 'hover:bg-white/10 text-slate-700 dark:text-slate-300'
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