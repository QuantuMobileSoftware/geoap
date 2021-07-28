import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { List } from '../../RequestsList';
import { Button } from 'components/_shared/Button';

import { useAreasActions, selectCurrentRequests } from 'state';
import { SIDEBAR_MODE, MODAL_TYPE } from '_constants';
import { areasEvents } from '_events';
import {
  ButtonWrapper,
  StyledIcon,
  ButtonTopWrapper,
  TabsWrapper,
  TabItem
} from './Requests.styles';

export const Requests = React.memo(() => {
  const requests = useSelector(selectCurrentRequests);

  const [isUpSortList, setIsUpSortList] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const { setSidebarMode } = useAreasActions();

  const filtered = useMemo(() => {
    return activeTab === 1 ? requests : requests.filter(r => !r.finished_at);
  }, [requests, activeTab]);

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
        <Button
          onClick={() =>
            areasEvents.toggleModal(true, {
              type: MODAL_TYPE.DELETE
              // id: reportId
            })
          }
        >
          Delete
        </Button>
      </ButtonTopWrapper>

      <List requests={filtered} />

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
