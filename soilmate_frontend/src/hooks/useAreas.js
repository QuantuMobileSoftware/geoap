import { useSelector } from 'react-redux';
import { selectUser, selectAreasList } from 'state';
import { getNewAreaNumber } from 'utils';
import { getShapePositionsString } from 'utils/helpers';
import { AOI_TYPE } from '_constants';

export const useAreaData = (layer, type) => {
  const currentUser = useSelector(selectUser);
  const initialAreas = useSelector(selectAreasList);
  if (!layer) return;

  const newAreaNumber = getNewAreaNumber(initialAreas, type);

  const data = {
    user: currentUser.pk,
    name: `New ${type === AOI_TYPE.AREA ? 'area' : 'field'} ${newAreaNumber}`,
    polygon: getShapePositionsString(layer),
    type: type
  };
  return data;
};
