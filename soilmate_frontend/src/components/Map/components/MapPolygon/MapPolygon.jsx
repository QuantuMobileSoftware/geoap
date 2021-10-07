import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import { Polygon } from 'react-leaflet';
import { useMapActions, useAreasActions } from 'state';
import { SHAPE_OPTIONS, SELECTED_SHAPE_OPTIONS } from '_constants';

export const MapPolygon = ({
  coordinates,
  onClick,
  isEditable,
  id,
  currentAreaId,
  currentAreaIndex,
  selectedResult
}) => {
  const polyRef = useRef(null);
  const { setEditableShape } = useMapActions();
  const { setEntitySize } = useAreasActions();
  const [prevAreaId, setPrevAreaId] = useState(currentAreaId);
  const [hasMvtResult, setHasMvtResult] = useState(false);

  const pathOptions = currentAreaId === id ? SELECTED_SHAPE_OPTIONS : SHAPE_OPTIONS;

  useEffect(() => {
    if (!prevAreaId) {
      setPrevAreaId(currentAreaId);
    }
    if (hasMvtResult && prevAreaId !== currentAreaId) {
      polyRef.current
        .getPane()
        .querySelectorAll('svg path')
        .forEach(item => (item.style.pointerEvents = 'auto'));
      setPrevAreaId(currentAreaId);
      setHasMvtResult(false);
    }
  }, [currentAreaId, prevAreaId, hasMvtResult]);

  useEffect(() => {
    if (
      currentAreaId === id &&
      currentAreaIndex >= 0 &&
      selectedResult?.layer_type === 'MVT' &&
      !hasMvtResult
    ) {
      polyRef.current.getPane().querySelectorAll('svg path')[
        currentAreaIndex
      ].style.pointerEvents = 'none';
      setHasMvtResult(true);
    }
  }, [currentAreaIndex, currentAreaId, id, selectedResult, hasMvtResult]);

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
  });

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
