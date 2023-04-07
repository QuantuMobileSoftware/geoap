import { isEmpty } from 'lodash-es';

export function hasSelectedNotebook(notebook) {
  if (!notebook || isEmpty(notebook)) return false;
  return notebook.additional_parameter?.trim() !== '';
}

export function convertDate(date) {
  const formatNumber = n => (n < 10 ? `0${n}` : n);
  const yyyy = date.getFullYear();
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  return `${yyyy}-${formatNumber(mm)}-${formatNumber(dd)}`;
}
