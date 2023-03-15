import { useState } from 'react';
import { send } from 'emailjs-com';

export const useEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const sendEmail = async values => {
    let isSent = false;
    setIsLoading(true);
    try {
      await send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        values,
        process.env.REACT_APP_EMAILJS_USER_ID
      );
      isSent = true;
    } catch (err) {
      setError(err.text);
    }
    setIsLoading(false);
    return isSent;
  };

  const clearError = () => setError(null);

  return { isLoading, sendEmail, error, clearError };
};
