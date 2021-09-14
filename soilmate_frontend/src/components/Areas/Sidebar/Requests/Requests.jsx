import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { remove } from 'lodash';

import { List } from '../../RequestsList';
import { Button } from 'components/_shared/Button';
import { Modal } from 'components/_shared/Modal';

import {
  useAreasActions,
  selectCurrentRequests,
  selectCurrentResults,
  getSelectedResults,
  selectRequestTab
} from 'state';
import { SIDEBAR_MODE, AOI_TYPE, GET_DATA_INTERVAL, REQUEST_TABS } from '_constants';
import {
  ButtonWrapper,
  StyledIcon,
  ButtonTopWrapper,
  TabsWrapper,
  TabItem,
  StyledSelect,
  DeleteButton,
  ModalButtonsWrapper
} from './Requests.styles';

const { CREATED, IN_PROGRESS } = REQUEST_TABS;

export const Requests = React.memo(({ currentArea }) => {
  const requests = useSelector(selectCurrentRequests);
  const results = useSelector(selectCurrentResults);
  const selectedResults = useSelector(getSelectedResults);
  const activeTab = useSelector(selectRequestTab);
  const {
    setSidebarMode,
    deleteResult,
    patchResults,
    setRequestTab,
    deleteSelectedResult
  } = useAreasActions();

  const [isUpSortList, setIsUpSortList] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const areaMode =
    currentArea.type === AOI_TYPE.AREA ? SIDEBAR_MODE.AREAS : SIDEBAR_MODE.FIELDS;
  const requestsInProgress = useMemo(
    () => requests.filter(request => !request.finished_at),
    [requests]
  );
  const filterItems = useMemo(() => {
    let reportNames;
    if (activeTab === CREATED) {
      reportNames = results.map(({ name, filepath }) => (name ? name : filepath));
    } else {
      reportNames = requestsInProgress.map(({ notebook_name }) => notebook_name);
    }
    reportNames = [...new Set(reportNames)];
    return [
      { name: 'All report type', value: '' },
      ...reportNames.map(name => ({ value: name, name }))
    ];
  }, [activeTab, requestsInProgress, results]);

  useEffect(() => {
    patchResults(currentArea);
    return () => setRequestTab(CREATED);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      patchResults(currentArea);
    }, GET_DATA_INTERVAL);
    return () => clearInterval(intervalId);
  }, [currentArea, patchResults]);

  const filteredResults = useMemo(() => {
    if (filterType) {
      return results.filter(({ name, filepath }) =>
        name ? name === filterType : filepath === filterType
      );
    } else {
      return results;
    }
  }, [results, filterType]);

  const filteredRequests = useMemo(() => {
    if (filterType) {
      return requestsInProgress.filter(
        ({ notebook_name }) => notebook_name === filterType
      );
    } else {
      return requestsInProgress;
    }
  }, [requestsInProgress, filterType]);

  const sortingListItems = useMemo(() => {
    const isCreatedTab = activeTab === CREATED;
    const items = isCreatedTab ? filteredResults : filteredRequests;
    const getValue = obj => {
      if (isCreatedTab) {
        return obj.name ? obj.name : obj.filepath;
      } else {
        return obj.notebook_name;
      }
    };
    if (isUpSortList) {
      return items.sort((prev, next) => getValue(prev).localeCompare(getValue(next)));
    }
    return items.sort((prev, next) => getValue(next).localeCompare(getValue(prev)));
  }, [isUpSortList, filteredResults, filteredRequests, activeTab]);

  const handleTabItemClick = tab => () => {
    setFilterType('');
    setRequestTab(tab);
  };
  const handleSortChange = () => setIsUpSortList(!isUpSortList);
  const handleSelectChange = item => {
    deleteSelectedResult();
    setFilterType(item.value);
  };
  const handleChangeMode = mode => () => setSidebarMode(mode);
  const handleDelete = () => {
    const filteredResults = {};
    handleCloseModal();
    const res = [...results];
    remove(res, el => selectedResults.some(id => id === el.id));
    res.forEach(item => (filteredResults[item.id] = item));
    deleteResult({ arrId: selectedResults, results: filteredResults });
  };
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenModal = () => setIsModalOpen(true);

  const resultLength = selectedResults.length;
  const modalHeader =
    resultLength > 1
      ? `Are you sure to delete ${resultLength} reports ?`
      : 'Are you sure to delete this report ?';

  return (
    <>
      <TabsWrapper>
        <TabItem isActive={activeTab === CREATED} onClick={handleTabItemClick(CREATED)}>
          Created reports
        </TabItem>
        <TabItem
          isActive={activeTab === IN_PROGRESS}
          onClick={handleTabItemClick(IN_PROGRESS)}
        >
          In progress
        </TabItem>
      </TabsWrapper>
      <ButtonTopWrapper>
        <Button onClick={handleSortChange}>
          Sorting <StyledIcon up={isUpSortList ? 'true' : ''}>ArrowUp</StyledIcon>
        </Button>
        <StyledSelect
          items={filterItems}
          value={filterType}
          onSelect={handleSelectChange}
        />
        {resultLength > 0 && <DeleteButton onClick={handleOpenModal} icon='Delete' />}
      </ButtonTopWrapper>

      <List requests={sortingListItems} />

      <ButtonWrapper>
        <Button
          icon='ArrowInCircle'
          variant='secondary'
          padding={50}
          onClick={handleChangeMode(areaMode)}
        >
          Cancel
        </Button>
        <Button
          icon='Plus'
          variant='primary'
          onClick={handleChangeMode(SIDEBAR_MODE.CREATE_REQUEST)}
        >
          Create new
        </Button>
      </ButtonWrapper>
      {isModalOpen && (
        <Modal header={modalHeader} textCenter={true} close={handleCloseModal}>
          <ModalButtonsWrapper>
            <Button variant='secondary' padding={50} onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant='primary' onClick={handleDelete}>
              Yes, delete
            </Button>
          </ModalButtonsWrapper>
        </Modal>
      )}
    </>
  );
});
