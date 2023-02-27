import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { FormikProvider, useFormik } from 'formik';

import {
  FormAction,
  FormActions,
  FormBody,
  FormHeader,
  FormMessage,
  FormMessageError,
  FormMessages,
  FormPreloader,
  StyledForm
} from './Form.styles';

import { withFunction } from 'utils';

export const Form = forwardRef(
  (
    {
      children,
      initialValues = {},
      validationSchema,
      header,
      error,
      message,
      actions = [],
      isLoading = false,
      onReset,
      onSubmit,
      params = {},
      ...props
    },
    ref
  ) => {
    const rootRef = useRef(null);

    const formik = useFormik({
      validateOnBlur: false,
      ...params,
      initialValues,
      validationSchema,
      enableReinitialize: true,
      onReset,
      onSubmit
    });

    useImperativeHandle(ref, () => ({ element: rootRef.current, ...formik }), [formik]);

    const canRenderFooter = error || message;

    const renderActions = () => {
      if (!actions || !actions.length) return null;

      return (
        <FormActions>
          {actions.map((action, i) => (
            <FormAction key={i}>{action}</FormAction>
          ))}
        </FormActions>
      );
    };

    return (
      <StyledForm
        {...props}
        ref={rootRef}
        onReset={formik.handleReset}
        onSubmit={formik.handleSubmit}
      >
        <FormikProvider value={formik}>
          {header && <FormHeader>{header}</FormHeader>}
          {children && <FormBody>{withFunction(children, formik)}</FormBody>}

          {renderActions()}

          {canRenderFooter && (
            <FormMessages>
              {error && <FormMessageError>{error}</FormMessageError>}
              {message && <FormMessage>{message}</FormMessage>}
            </FormMessages>
          )}

          {isLoading && <FormPreloader />}
        </FormikProvider>
      </StyledForm>
    );
  }
);
