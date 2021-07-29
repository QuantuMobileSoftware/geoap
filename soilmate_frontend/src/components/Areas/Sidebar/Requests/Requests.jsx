import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { List } from '../../RequestsList';
import { Button } from 'components/_shared/Button';

import { useAreasActions, selectCurrentRequests, selectLayers } from 'state';
import { SIDEBAR_MODE } from '_constants';
import {
  ButtonWrapper,
  StyledIcon,
  ButtonTopWrapper,
  TabsWrapper,
  TabItem,
  StyledSelect
} from './Requests.styles';

export const Requests = React.memo(() => {
  const requests = useSelector(selectCurrentRequests);
  const requestTypes = useSelector(selectLayers);

  const [isUpSortList, setIsUpSortList] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const [filterType, setFilterType] = useState('');
  const { setSidebarMode } = useAreasActions();

  const selectItems = useMemo(
    () => [
      { name: 'All report type', value: '' },
      ...requestTypes.map(({ name, id }) => ({ value: id, name }))
    ],
    [requestTypes]
  );

  const filtered = useMemo(() => {
    const filtered = filterType
      ? requests.filter(r => r.notebook === filterType)
      : requests;
    return activeTab === 1 ? filtered : filtered.filter(r => !r.finished_at);
  }, [requests, activeTab, filterType]);

  const sortingListItems = useMemo(() => {
    if (isUpSortList) {
      return filtered.sort((prev, next) =>
        prev.notebook_name.localeCompare(next.notebook_name)
      );
    }
    return filtered.sort((prev, next) =>
      next.notebook_name.localeCompare(prev.notebook_name)
    );
  }, [isUpSortList, filtered]);

  return (
    <>
      <TabsWrapper>
        <TabItem isActive={activeTab === 1} onClick={() => setActiveTab(1)}>
          Created reports
        </TabItem>
        <TabItem isActive={activeTab === 2} onClick={() => setActiveTab(2)}>
          In progress
        </TabItem>
      </TabsWrapper>
      <ButtonTopWrapper>
        <Button onClick={() => setIsUpSortList(!isUpSortList)}>
          Sorting <StyledIcon up={isUpSortList ? 'true' : ''}>ArrowUp</StyledIcon>
        </Button>
        <StyledSelect
          items={selectItems}
          value=''
          onSelect={item => setFilterType(item.value)}
        />
      </ButtonTopWrapper>

      <List requests={sortingListItems} />

      <ButtonWrapper>
        <Button
          icon='ArrowInCircle'
          variant='secondary'
          padding={50}
          onClick={() => setSidebarMode(SIDEBAR_MODE.LIST)}
        >
          Cancel
        </Button>
        <Button icon='Plus' variant='primary' onClick={() => {}}>
          Create new
        </Button>
      </ButtonWrapper>
    </>
  );
});
