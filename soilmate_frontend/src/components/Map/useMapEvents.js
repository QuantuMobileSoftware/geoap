import { useEffect, useCallback } from 'react';
import { EDITABLE_SHAPE_OPTIONS, SHAPE_OPTIONS } from '_constants';
import { useMapActions } from 'state';
import { getShapePositionsString } from 'utils/helpers';

export const useMapEvents = (map, setPopup, setCurrentShape) => {
  const { setEditableShape } = useMapActions();

  const afterShapeCreated = useCallback(
    e => {
      setPopup(true);
      setCurrentShape(e.layer);
    },
    [setCurrentShape, setPopup]
  );

  useEffect(() => {
    if (map) {
      map.on('draw:created', afterShapeCreated);
      return () => map.off('draw:created', afterShapeCreated);
    }
  }, [map, afterShapeCreated]);

  useEffect(() => {
    const handleEditShape = e => setEditableShape(getShapePositionsString(e.layer));
    if (map) {
      map.on('editable:editing', handleEditShape);
      return () => map.off('editable:editing', handleEditShape);
    }
  }, [map, setEditableShape]);

  useEffect(() => {
    const handleEditShape = e => e.layer.setStyle(EDITABLE_SHAPE_OPTIONS);
    if (map) {
      map.on('editable:enable', handleEditShape);
      return () => map.off('editable:enable', handleEditShape);
    }
  }, [map]);

  useEffect(() => {
    const handleEditShape = e => e.layer.setStyle(SHAPE_OPTIONS);
    if (map) {
      map.on('editable:disable', handleEditShape);
      return () => map.off('editable:disable', handleEditShape);
    }
  }, [map]);
};
