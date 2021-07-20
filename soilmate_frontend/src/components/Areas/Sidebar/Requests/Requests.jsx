import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { List } from '../../RequestsList';
import { Search } from 'components/_shared/Search';
import { SIDEBAR_MODE } from '_constants';
import { RequestsSidebarMessage, ButtonWrapper } from './Requests.styles';
import { Button } from 'components/_shared/Button';
import { useAreasActions, selectCurrentRequests } from 'state';

export const Requests = React.memo(() => {
  const requests = useSelector(selectCurrentRequests);

  const [isRequestNotFound, setIsRequestNotFound] = useState(false);
  const [listItems, setListItems] = useState(requests);
  const { setSidebarMode } = useAreasActions();

  const resetRequests = () => {
    setIsRequestNotFound(false);
    setListItems(requests);
  };

  const searchRequestsByQuery = query => {
    if (!query) {
      resetRequests();
      return;
    }

    const foundRequests = requests.filter(area => {
      return area.name.match(query, 'gi');
    });

    if (!foundRequests.length) {
      setListItems([]);
      setIsRequestNotFound(true);
      return;
    }

    setIsRequestNotFound(false);
    setListItems(foundRequests);
  };

  const handleSearchSubmit = values => {
    searchRequestsByQuery(values.query);
  };

  const handleSearchChange = e => {
    searchRequestsByQuery(e.target.value);
  };

  const handleSearchReset = () => {
    resetRequests();
  };

  return (
    <>
      <Search
        control={{ placeholder: 'Search by name', autoComplete: 'off' }}
        onReset={handleSearchReset}
        onSubmit={handleSearchSubmit}
        onChange={handleSearchChange}
      />

      <List requests={listItems} />

      {isRequestNotFound && (
        <RequestsSidebarMessage>Request not found</RequestsSidebarMessage>
      )}

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
