'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type FilterType = 'mes_atual' | 'mes_anterior' | 'ultimos_3_meses' | 'personalizado';

interface FilterContextData {
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  startDate: string;
  endDate: string;
  setCustomDate: (start: string, end: string) => void;
}

const FilterContext = createContext<FilterContextData>({} as FilterContextData);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filterType, setFilterType] = useState<FilterType>('mes_atual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const today = new Date();
    
    if (filterType === 'mes_atual') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    } else if (filterType === 'mes_anterior') {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    } else if (filterType === 'ultimos_3_meses') {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 2, 1); // 3 months including current
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    }
  }, [filterType]);

  const setCustomDate = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setFilterType('personalizado');
  };

  return (
    <FilterContext.Provider value={{ filterType, setFilterType, startDate, endDate, setCustomDate }}>
      {children}
    </FilterContext.Provider>
  );
}

export const useFilter = () => useContext(FilterContext);
