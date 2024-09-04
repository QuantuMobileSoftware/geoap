import React, { useMemo, useState } from 'react';
import { Spinner } from 'components/_shared/Spinner';
import { ViewReportBtn } from './ViewReportBtn';
import { InfoModal } from './InfoModal';
import { MonthPicker } from 'components/_shared/Calendar';
import { formatSquareKilometers, getTransactionDate } from 'utils';
import { useTransactionData } from './hooks';

import {
  TableHeader,
  TableComment,
  TableAmount,
  Filter,
  ClearFilterBtn,
  NotebookName,
  StyledButton
} from './Transactions.styles';

export const Transactions = () => {
  const [isFiltered, setIsFiltered] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isShowSize, setIsShowSize] = useState(false);
  const [modalText, setModalText] = useState(null);
  const { isLoading, transactions, requests, results, areas } = useTransactionData();

  const rowsData = useMemo(() => {
    return isFiltered
      ? transactions.filter(
          ({ created_at }) =>
            getTransactionDate(created_at) === getTransactionDate(selectedDate)
        )
      : transactions;
  }, [isFiltered, selectedDate, transactions]);

  const handleApplyMonth = () => {
    if (!selectedDate) setSelectedDate(new Date());
    setIsFiltered(true);
  };
  const handleResetFilter = () => setIsFiltered(false);
  const handleCloseModal = () => setModalText(null);
  const handleOpenModal = t => setModalText(`${t.comment ?? ''}  ${t.error ?? ''}`);

  if (isLoading) return <Spinner />;

  if (!transactions?.length) return <h3>You have no transactions</h3>;

  const firstTransaction = new Date(transactions[transactions.length - 1].created_at);

  return (
    <div>
      <Filter>
        <MonthPicker
          selectedDate={selectedDate}
          onChange={setSelectedDate}
          onApply={handleApplyMonth}
          minDate={new Date(firstTransaction.getFullYear(), firstTransaction.getMonth())}
          maxDate={Date.now()}
        />
        {isFiltered && (
          <ClearFilterBtn variant='primary' onClick={handleResetFilter}>
            Show all
          </ClearFilterBtn>
        )}
      </Filter>
      <table>
        <tbody>
          <tr>
            <TableHeader>Date</TableHeader>
            <TableHeader>Amount</TableHeader>
            {isShowSize && <TableHeader>Size</TableHeader>}
            <TableHeader>Status</TableHeader>
            <TableHeader>Request</TableHeader>
          </tr>
          {rowsData?.map(t => {
            const isNegativeAmount = t.amount < 0;
            const date = t.created_at.split('T')[0].replaceAll('-', '.');
            const completeText = t.completed ? 'done' : 'in progress';
            const isShowViewButton = t.request && !t.error && !t.rolled_back;
            const amount = isNegativeAmount
              ? `- $${Math.abs(t.amount)}`
              : `${t.amount === 0 ? '' : '+'} $${t.amount}`;
            const request = requests[t.request]; // request can be null
            const area = areas[request?.aoi];
            if (!isShowSize && area?.square_in_km) setIsShowSize(true);

            return (
              <tr key={t.id}>
                <td>{date}</td>
                <TableAmount negative={isNegativeAmount}>{amount}</TableAmount>
                {isShowSize && (
                  <td>
                    {area?.square_in_km
                      ? `${formatSquareKilometers(area.square_in_km)} sq km`
                      : ''}
                  </td>
                )}
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
                    <StyledButton onClick={() => handleOpenModal(t)}>Info</StyledButton>
                  )}
                </TableComment>
              </tr>
            );
          })}
        </tbody>
      </table>
      {modalText && <InfoModal onClose={handleCloseModal} content={modalText} />}
    </div>
  );
};
