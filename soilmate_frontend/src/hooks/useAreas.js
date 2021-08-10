import { useSelector } from 'react-redux';
import { selectUser, selectAreasList } from 'state';
import { getShapePositionsString } from 'utils/helpers';
import { AOI_TYPE } from '_constants';

export const useAreaData = (layer, type) => {
  const currentUser = useSelector(selectUser);
  const initialAreas = useSelector(selectAreasList);
  if (!layer) return;

  const newAreaNumber = initialAreas.filter(area => area.type === AOI_TYPE.AREA).length
    ? initialAreas[initialAreas.length - 1].id + 1
    : 1;

  const data = {
    user: currentUser.pk,
    name: `New ${type === AOI_TYPE.AREA ? 'area' : 'field'} ${newAreaNumber}`,
    polygon: getShapePositionsString(layer),
    type: type
  };
  return data;
};
