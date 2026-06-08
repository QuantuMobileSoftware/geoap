import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { StoneValidation } from './StoneValidation';
import { API } from 'api';
import { areasEvents } from '_events';
import { ROUTES } from '_constants';
import { getSelectedResults, selectCurrentResults } from 'state';

jest.mock('lodash-es', () => require('lodash'));
jest.mock('react-redux', () => ({ useSelector: jest.fn() }));
jest.mock('react-router-dom', () => ({ useHistory: jest.fn() }));
jest.mock('api', () => ({
  API: {
    files: { getStoneImages: jest.fn() },
    areas: { deleteResult: jest.fn() },
  },
}));
jest.mock('_events', () => ({ areasEvents: { toggleErrorModal: jest.fn() } }));

jest.mock('./components', () => ({
  ImageViewer: () => null,
  Header: () => null,
  ImageList: () => null,
}));
jest.mock('components/Header', () => ({ Header: () => null }));
jest.mock('components/_shared/Spinner', () => ({ Spinner: () => null }));
jest.mock('./StoneValidation.styles', () => ({
  Container: ({ children }) => <div>{children}</div>,
  NoDataText: ({ children }) => <div data-testid='no-data'>{children}</div>,
}));

const mockResult = { id: 7, name: 'Test Result' };
const mockPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useHistory.mockReturnValue({ push: mockPush });
  API.areas.deleteResult.mockResolvedValue({});
  useSelector.mockImplementation(selector => {
    if (selector === selectCurrentResults) return [mockResult];
    if (selector === getSelectedResults) return [mockResult.id];
    return undefined;
  });
});

describe('StoneValidation — empty file', () => {
  it('deletes the result, navigates to main, and notifies when file is empty', async () => {
    API.files.getStoneImages.mockResolvedValue({});

    render(<StoneValidation />);

    await waitFor(() => {
      expect(API.areas.deleteResult).toHaveBeenCalledWith(mockResult.id);
      expect(mockPush).toHaveBeenCalledWith(ROUTES.ROOT);
      expect(areasEvents.toggleErrorModal).toHaveBeenCalledWith(
        'No stones detected. The result file has been removed.'
      );
    });
  });

  it('notifies but does not delete the result when API errors', async () => {
    API.files.getStoneImages.mockRejectedValue(new Error('network error'));

    render(<StoneValidation />);

    await waitFor(() => {
      expect(API.areas.deleteResult).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
      expect(areasEvents.toggleErrorModal).toHaveBeenCalledWith('Failed to load validation file.');
    });
  });
});
