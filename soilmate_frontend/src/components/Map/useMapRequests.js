import { useEffect } from 'react';
import { areasEvents } from '_events';
import { useSelector } from 'react-redux';
import L from 'leaflet';
import { selectSelectedResults } from 'state';

export const useMapRequests = (selectedArea, map) => {
  const results = useSelector(selectSelectedResults);
  const selectedResults = [];
  results.forEach(id => {
    const result = selectedArea.results.find(result => result.id === id);
    if (result) {
      selectedResults.push(result);
    }
  });

  useEffect(() => {
    return areasEvents.onSelectRequest(() => {
      //show results in map
    });
  });
};
