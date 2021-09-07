import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import { Polygon } from 'react-leaflet';
import { useMapActions, useAreasActions } from 'state';
import { SHAPE_OPTIONS, SELECTED_SHAPE_OPTIONS } from '_constants';

export const MapPolygon = ({ coordinates, onClick, isEditable, id, currentAreaId }) => {
  const polyRef = useRef(null);
  const { setEditableShape } = useMapActions();
  const { setEntitySize } = useAreasActions();

  const pathOptions = currentAreaId === id ? SELECTED_SHAPE_OPTIONS : SHAPE_OPTIONS;

  useEffect(() => {
    if (polyRef.current) {
      const area = L.GeometryUtil.geodesicArea(polyRef.current?.getLatLngs()[0]);
      setEntitySize(id, Math.round(area));
    }
  }, [polyRef, setEntitySize, id]);

  useEffect(() => {
    const { current } = polyRef;
    if (isEditable) {
      setEditableShape(null);
      current.enableEdit();
    } else {
      current.disableEdit();
    }
    return () => current.disableEdit();
  }, [isEditable, setEditableShape]);

  return (
    <Polygon
      ref={polyRef}
      positions={coordinates}
      pathOptions={pathOptions}
      eventHandlers={{
        click: () => onClick(polyRef.current)
      }}
    />
  );
};
