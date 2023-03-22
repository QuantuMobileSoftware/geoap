import React, { useEffect, useMemo, useState } from 'react';
import { useAsync } from 'hooks';
import { useSelector } from 'react-redux';
import { API } from 'api';
import { useAreasActions, selectLayers } from 'state';
import { Spinner } from 'components/_shared/Spinner';
import {
  TableHeader,
  TableComment,
  TableAmount,
  LayerName,
  Filter,
  ClearFilterBtn
} from './Transactions.styles';
import { MonthPicker } from 'components/_shared/Calendar';
import { getTransactionDate } from 'utils';

export const Transactions = () => {
  const { isLoading, handleAsync } = useAsync();
  const { getLayers } = useAreasActions();
  const layers = useSelector(selectLayers);
  const [transactions, setTransactions] = useState();
  const [isFiltered, setIsFiltered] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    handleAsync(async () => {
      const resp = await API.transactions.getTransactions();
      if (resp.statusText === 'OK')
        setTransactions(
          resp.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        );
    });
  }, [handleAsync]);

  useEffect(() => {
    getLayers();
  }, [getLayers]);

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

  const firstTransaction = new Date(transactions[0].created_at);

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
            <TableHeader>Request</TableHeader>
          </tr>
          {rowsData?.map(t => {
            const isNegativeAmount = t.amount < 0;
            const date = t.created_at.split('T')[0].replaceAll('-', '.');
            const layer = layers.find(l => l.id === t.request)?.name;
            const amount = isNegativeAmount
              ? `- $${Math.abs(t.amount)}`
              : `+ $${t.amount}`;

            return (
              <tr key={t.id}>
                <td>{date}</td>
                <TableAmount negative={isNegativeAmount}>{amount}</TableAmount>
                <TableComment>
                  {t.request && <LayerName>{layer}. </LayerName>}
                  {t.comment}
                </TableComment>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
