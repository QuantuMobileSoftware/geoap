import React, { useState } from 'react';
import { Spinner } from 'components/_shared/Spinner';
import { ViewReportBtn } from './ViewReportBtn';
import { InfoModal } from './InfoModal';
import { MonthPicker } from 'components/_shared/Calendar';
import { formatSquareKilometers } from 'utils';
import { useTransactionData, PAGE_SIZE } from './hooks';

import {
  TableHeader,
  TableComment,
  TableAmount,
  Filter,
  ClearFilterBtn,
  NotebookName,
  StyledButton,
  Pagination,
  PageInfo
} from './Transactions.styles';

export const Transactions = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isShowSize, setIsShowSize] = useState(false);
  const [modalText, setModalText] = useState(null);
  const {
    isLoading,
    transactions,
    requests,
    results,
    areas,
    page,
    setPage,
    totalCount,
    filter,
    applyFilter,
    clearFilter
  } = useTransactionData();

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleApplyMonth = () => {
    applyFilter(selectedDate);
  };

  const handleResetFilter = () => {
    setSelectedDate(null);
    clearFilter();
  };

  const handleCloseModal = () => setModalText(null);
  const handleOpenModal = t => setModalText(`${t.comment ?? ''}  ${t.error ?? ''}`);

  if (isLoading) return <Spinner />;

  if (!filter && !transactions?.length) return <h3>You have no transactions</h3>;

  return (
    <div>
      <Filter>
        <MonthPicker
          selectedDate={selectedDate}
          onChange={setSelectedDate}
          onApply={handleApplyMonth}
          maxDate={Date.now()}
        />
        {filter && (
          <ClearFilterBtn variant='primary' onClick={handleResetFilter}>
            Show all
          </ClearFilterBtn>
        )}
      </Filter>
      {transactions?.length ? (
        <>
          <table>
            <tbody>
              <tr>
                <TableHeader>Date</TableHeader>
                <TableHeader>Amount</TableHeader>
                {isShowSize && <TableHeader>Size</TableHeader>}
                <TableHeader>Status</TableHeader>
                <TableHeader>Request</TableHeader>
              </tr>
              {transactions.map(t => {
                const isNegativeAmount = t.amount < 0;
                const date = t.created_at.split('T')[0].replaceAll('-', '.');
                const completeText = t.completed ? 'done' : 'in progress';
                const isShowViewButton = t.request && !t.error && !t.rolled_back;
                const amount = isNegativeAmount
                  ? `- $${Math.abs(t.amount)}`
                  : `${t.amount === 0 ? '' : '+'} $${t.amount}`;
                const request = requests[t.request];
                const area = areas[request?.aoi];
                const isRefund = t.amount > 0;
                const sizeText =
                  t.area_sq_km != null
                    ? isRefund && t.processed_area_sq_km != null
                      ? `${formatSquareKilometers(
                          t.area_sq_km - t.processed_area_sq_km
                        )} sq km`
                      : `${formatSquareKilometers(t.area_sq_km)} sq km`
                    : '';
                if (!isShowSize && sizeText) setIsShowSize(true);

                return (
                  <tr key={t.id}>
                    <td>{date}</td>
                    <TableAmount negative={isNegativeAmount}>{amount}</TableAmount>
                    {isShowSize && <td>{sizeText}</td>}
                    <td>{t.rolled_back ? 'rolled back' : completeText}</td>
                    <TableComment>
                      {!t.request && t.comment}
                      {request && <NotebookName>{request.notebook_name}</NotebookName>}
                      {area && `Area: ${area.name}. `}
                      {isShowViewButton && (
                        <ViewReportBtn area={area} request={t.request} results={results}>
                          View report
                        </ViewReportBtn>
                      )}
                      {t.rolled_back && (t.comment || t.error) && (
                        <StyledButton onClick={() => handleOpenModal(t)}>
                          Info
                        </StyledButton>
                      )}
                    </TableComment>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {totalPages > 1 && (
            <Pagination>
              <StyledButton
                variant='primary'
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
              >
                Previous
              </StyledButton>
              <PageInfo>
                Page {page} of {totalPages}
              </PageInfo>
              <StyledButton
                variant='primary'
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
              >
                Next
              </StyledButton>
            </Pagination>
          )}
        </>
      ) : (
        <h3>No transactions for this period</h3>
      )}
      {modalText && <InfoModal onClose={handleCloseModal} content={modalText} />}
    </div>
  );
};
