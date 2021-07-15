import React, { useRef, useEffect } from 'react';
import { Polygon } from 'react-leaflet';
import { useMapActions } from 'state';
import { SHAPE_OPTIONS } from '_constants';

export const MapPolygon = ({ coordinates, onClick, isEditable }) => {
  const polyRef = useRef(null);
  const { setEditableShape } = useMapActions();

  useEffect(() => {
    if (isEditable) {
      setEditableShape(null);
      polyRef.current.enableEdit();
    } else {
      polyRef.current.disableEdit();
    }
  }, [isEditable, setEditableShape]);

  return (
    <Polygon
      ref={polyRef}
      positions={coordinates}
      pathOptions={SHAPE_OPTIONS}
      eventHandlers={{
        click: () => onClick(polyRef.current)
      }}
    />
  );
};
