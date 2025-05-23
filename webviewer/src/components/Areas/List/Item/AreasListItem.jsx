import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { isNumber } from 'lodash-es';

import { Checkbox } from 'components/_shared/Checkbox';
import {
  useAreasActions,
  useMapActions,
  selectCurrentArea,
  getSelectedEntitiesId
} from 'state';
import { getPolygonPositions, getElementBottom } from 'utils/helpers';
import { areasEvents } from '_events';
import { SIDEBAR_MODE, MODAL_TYPE } from '_constants';

import {
  AreasListItemBody,
  AreasListItemSize,
  AreasListItemMenu,
  AreasListItemName,
  AreasListItem,
  AreasListItemButton
} from './AreasListItem.styles';
import round from 'lodash/round';

const itemSize = 60;

export const ListItem = ({ area = {}, areaAmount, parent, ...props }) => {
  const {
    setCurrentArea,
    setSidebarMode,
    setSelectedEntityId,
    deleteSelectedEntityId,
    deleteSelectedResult
  } = useAreasActions();
  const { setLayerOpacity } = useMapActions();
  const currentAreaId = useSelector(selectCurrentArea);
  const selectedAreas = useSelector(getSelectedEntitiesId);
  const areaRef = useRef(null);
  const [isTopPosition, setIsTopPosition] = useState(false);

  const coordinatesArray = getPolygonPositions(area).coordinates[0][0];
  const coordinates = [
    ['X', +coordinatesArray[0].toFixed(1)],
    ['Y', +coordinatesArray[1].toFixed(1)]
  ];
  const hasCoordinates = coordinates.some(([, c]) => c && isNumber(c));
  const isChecked = selectedAreas.includes(area.id);

  useEffect(() => {
    if (area.id === currentAreaId) {
      areaRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }
  }, [area.id, currentAreaId]);

  const handleAreaListItemClick = () => {
    setCurrentArea(area.id);
    deleteSelectedResult();
    setLayerOpacity(1);
  };

  const handleChangeCheckbox = isChecked => {
    if (isChecked) {
      setSelectedEntityId(area.id);
    } else {
      deleteSelectedEntityId(area.id);
    }
  };

  const handleEditArea = () => {
    setCurrentArea(area.id);
    setSidebarMode(SIDEBAR_MODE.EDIT);
  };

  const handleMenuClick = () => {
    if (areaAmount > 2) {
      setIsTopPosition(getElementBottom(parent) <= getElementBottom(areaRef) + itemSize);
    } else {
      setIsTopPosition(false);
    }
  };

  const handleViewReports = () => {
    setCurrentArea(area.id);
    setSidebarMode(SIDEBAR_MODE.REPORTS);
  };

  const handleDeleteButton = () => {
    areasEvents.toggleModal(true, { type: MODAL_TYPE.DELETE, id: area.id });
  };

  return (
    <AreasListItem
      {...props}
      top={isTopPosition}
      ref={areaRef}
      hasCoordinates={hasCoordinates}
      onClick={handleAreaListItemClick}
      onDoubleClick={handleViewReports}
    >
      <Checkbox checked={isChecked} onChange={handleChangeCheckbox} />

      <AreasListItemBody>
        <AreasListItemName>{area.name}</AreasListItemName>
        {area.hasOwnProperty('square_in_km') && (
          <AreasListItemSize>Size: {round(area.square_in_km, 3)} km2</AreasListItemSize>
        )}
      </AreasListItemBody>

      <AreasListItemMenu onClick={handleMenuClick}>
        <AreasListItemButton onClick={handleEditArea}>Edit</AreasListItemButton>
        <AreasListItemButton onClick={handleViewReports}>
          View reports
        </AreasListItemButton>
        <AreasListItemButton variantType='danger' onClick={handleDeleteButton}>
          Delete
        </AreasListItemButton>
      </AreasListItemMenu>
    </AreasListItem>
  );
};
