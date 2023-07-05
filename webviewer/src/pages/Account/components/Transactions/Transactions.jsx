import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAsync } from 'hooks';
import { API } from 'api';
import { useAreasActions, selectAreasList } from 'state';
import { Spinner } from 'components/_shared/Spinner';
import { ViewReportBtn } from './ViewReportBtn';
import { MonthPicker } from 'components/_shared/Calendar';
import { getTransactionDate } from 'utils';
import {
  TableHeader,
  TableComment,
  TableAmount,
  Filter,
  ClearFilterBtn
} from './Transactions.styles';

export const Transactions = () => {
  const { isLoading, handleAsync } = useAsync();
  const { getLayers, getAreas } = useAreasActions();
  const areas = useSelector(selectAreasList);
  const [transactions, setTransactions] = useState();
  const [isFiltered, setIsFiltered] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    handleAsync(async () => {
      const resp = await API.transactions.getTransactions();
      if (resp.statusText === 'OK')
        setTransactions(
          resp.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        );
    });
  }, [handleAsync]);

  useEffect(() => {
    getLayers();
  }, [getLayers]);

  useEffect(() => {
    if (areas.length) return;
    getAreas();
  }, [getAreas, areas.length]);

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
            <TableHeader>Status</TableHeader>
            <TableHeader>Comment</TableHeader>
          </tr>
          {rowsData?.map(t => {
            const isNegativeAmount = t.amount < 0;
            const date = t.created_at.split('T')[0].replaceAll('-', '.');
            const completeText = t.completed ? 'done' : 'in progress';
            const amount = isNegativeAmount
              ? `- $${Math.abs(t.amount)}`
              : `${t.amount === 0 ? '' : '+'} $${t.amount}`;

            return (
              <tr key={t.id}>
                <td>{date}</td>
                <TableAmount negative={isNegativeAmount}>{amount}</TableAmount>
                <td>{t.rolled_back ? 'rolled back' : completeText}</td>
                <TableComment>
                  {t.comment}
                  {t.error && `Error: ${t.error}`}
                  {t.request && !t.error && (
                    <ViewReportBtn request={t.request} areas={areas}>
                      View report
                    </ViewReportBtn>
                  )}
                </TableComment>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
