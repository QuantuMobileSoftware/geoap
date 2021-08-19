import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { remove } from 'lodash';

import { List } from '../../RequestsList';
import { Button } from 'components/_shared/Button';
import { Modal } from 'components/_shared/Modal';

import {
  useAreasActions,
  selectCurrentRequests,
  selectCurrentResults,
  selectLayers,
  selectSelectedResults
} from 'state';
import { SIDEBAR_MODE, AOI_TYPE } from '_constants';
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

export const Requests = React.memo(({ areaType }) => {
  const requests = useSelector(selectCurrentRequests);
  const results = useSelector(selectCurrentResults);
  const requestTypes = useSelector(selectLayers);
  const selectedResults = useSelector(selectSelectedResults);
  const { setSidebarMode, deleteResult } = useAreasActions();

  const [isUpSortList, setIsUpSortList] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const [filterType, setFilterType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const areaMode = areaType === AOI_TYPE.AREA ? SIDEBAR_MODE.AREAS : SIDEBAR_MODE.FIELDS;

  const selectItems = useMemo(
    () => [
      { name: 'All report type', value: '' },
      ...requestTypes.map(({ name, id }) => ({ value: id, name }))
    ],
    [requestTypes]
  );

  const filteredRequest = useMemo(() => {
    const filtered = filterType
      ? requests.filter(r => r.notebook === filterType)
      : requests;
    return activeTab === 1 ? filtered : filtered.filter(r => !r.finished_at);
  }, [requests, activeTab, filterType]);

  const filteredResults = useMemo(() => {
    const filtered = [];
    if (activeTab === 2) {
      return filteredRequest;
    }
    if (!filterType) {
      return results;
    }
    results.forEach(r => {
      const result = filteredRequest.some(item => item.id === r.request);
      if (result) {
        filtered.push(r);
      }
    });
    return filtered;
  }, [results, filteredRequest, filterType, activeTab]);

  const sortingListItems = useMemo(() => {
    const getValue = obj => (obj.name ? obj.name : obj.filepath);
    if (isUpSortList) {
      return filteredResults.sort((prev, next) =>
        getValue(prev).localeCompare(getValue(next))
      );
    }
    return filteredResults.sort((prev, next) =>
      getValue(next).localeCompare(getValue(prev))
    );
  }, [isUpSortList, filteredResults]);

  const handleTabItemClick = tab => () => setActiveTab(tab);
  const handleSortChange = () => setIsUpSortList(!isUpSortList);
  const handleSelectChange = item => setFilterType(item.value);
  const handleChangeMode = mode => () => setSidebarMode(mode);
  const handleDelete = () => {
    const filteredResults = {};
    handleCloseModal();
    remove(results, el => selectedResults.some(id => id === el.id));
    results.forEach(item => (filteredResults[item.id] = item));
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
        <TabItem isActive={activeTab === 1} onClick={handleTabItemClick(1)}>
          Created reports
        </TabItem>
        <TabItem isActive={activeTab === 2} onClick={handleTabItemClick(2)}>
          In progress
        </TabItem>
      </TabsWrapper>
      <ButtonTopWrapper>
        <Button onClick={handleSortChange}>
          Sorting <StyledIcon up={isUpSortList ? 'true' : ''}>ArrowUp</StyledIcon>
        </Button>
        <StyledSelect items={selectItems} value='' onSelect={handleSelectChange} />
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
          onClick={handleChangeMode(SIDEBAR_MODE.REQUEST_SETTINGS)}
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
