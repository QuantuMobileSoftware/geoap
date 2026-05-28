import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { areasEvents } from '_events';
import { axiosInstance } from './instance';

jest.mock('_events', () => ({
  areasEvents: {
    toggleErrorModal: jest.fn()
  }
}));

const mockReplace = jest.fn();
Object.defineProperty(window, 'location', {
  value: { replace: mockReplace, pathname: '/' },
  writable: true
});

const mock = new MockAdapter(axiosInstance);

afterEach(() => {
  mock.reset();
  jest.clearAllMocks();
});

describe('axiosInstance interceptor', () => {
  it('redirects to /auth on expired session (403 + credentials detail)', async () => {
    mock.onGet('/test').reply(403, {
      detail: 'Authentication credentials were not provided.'
    });

    await expect(axiosInstance.get('/test')).rejects.toBeDefined();

    expect(mockReplace).toHaveBeenCalledWith('/auth');
    expect(areasEvents.toggleErrorModal).not.toHaveBeenCalled();
  });

  it('shows error modal on regular 403 (no permission, logged in)', async () => {
    mock.onGet('/test').reply(403, { detail: 'You do not have permission.' });

    await expect(axiosInstance.get('/test')).rejects.toBeDefined();

    expect(mockReplace).not.toHaveBeenCalled();
    expect(areasEvents.toggleErrorModal).toHaveBeenCalledTimes(1);
  });

  it('shows error modal on 403 with size errorCode 603', async () => {
    mock.onGet('/test').reply(403, { errorCode: 603 });

    await expect(axiosInstance.get('/test')).rejects.toBeDefined();

    expect(mockReplace).not.toHaveBeenCalled();
    expect(areasEvents.toggleErrorModal).toHaveBeenCalledTimes(1);
  });

  it('shows error modal on 500 server error', async () => {
    mock.onGet('/test').reply(500, { detail: 'Internal Server Error' });

    await expect(axiosInstance.get('/test')).rejects.toBeDefined();

    expect(mockReplace).not.toHaveBeenCalled();
    expect(areasEvents.toggleErrorModal).toHaveBeenCalledTimes(1);
  });

  it('does not redirect when already on /auth (prevents infinite loop)', async () => {
    window.location.pathname = '/auth';
    mock.onGet('/test').reply(403, {
      detail: 'Authentication credentials were not provided.'
    });

    await expect(axiosInstance.get('/test')).rejects.toBeDefined();

    expect(mockReplace).not.toHaveBeenCalled();
    expect(areasEvents.toggleErrorModal).toHaveBeenCalledTimes(1);

    window.location.pathname = '/';
  });

  it('does not show error modal when skipErrorModal is set', async () => {
    mock.onGet('/test').reply(400, { detail: 'Bad request' });

    await expect(
      axiosInstance.get('/test', { skipErrorModal: true })
    ).rejects.toBeDefined();

    expect(areasEvents.toggleErrorModal).not.toHaveBeenCalled();
  });
});
