import React, { forwardRef, isValidElement, useMemo } from 'react';
import { useField } from 'formik';
import { isFunction, upperFirst } from 'lodash-es';

import {
  FormFieldControl,
  FormFieldLabel,
  FormFieldMessage,
  FormFieldMessageError,
  FormFieldMessages,
  StyledFormField
} from './FormField.styles';

import { InputText } from 'components/_shared/Input';

import { withFunction, mergeProps } from 'utils';

// TODO: Add more field types
const FIELD_TYPE_CONTROLS = {
  text: <InputText type='text' />,
  email: <InputText type='email' />,
  password: <InputText type='password' />
};

let previousFieldId = 0;

export const FormField = forwardRef(
  (
    {
      id: initialId,
      className,
      name,
      type = 'text',
      label,
      error,
      message,
      control,
      ...props
    },
    ref
  ) => {
    const [field, meta, helpers] = useField(name);
    const id = useMemo(() => initialId || `field-${++previousFieldId}`, [initialId]);

    const messageError = error || (meta.touched && meta.error);
    const canRenderMessages = messageError || message;

    const renderControl = () => {
      let controlElement = null;
      const isCustomControl = control && (isFunction(control) || isValidElement(control));

      if (type) controlElement = FIELD_TYPE_CONTROLS[type];

      if (isCustomControl) {
        controlElement = withFunction(control, { field, meta, helpers });
      }

      if (!controlElement) return null;

      const mergedProps = mergeProps(controlElement.props, [{ ...props, id }, field]);

      return <FormFieldControl {...mergedProps}>{controlElement}</FormFieldControl>;
    };

    return (
      <StyledFormField {...props} ref={ref} className={className}>
        {label && <FormFieldLabel htmlFor={id}>{upperFirst(label)}</FormFieldLabel>}

        {renderControl()}

        {canRenderMessages && (
          <FormFieldMessages>
            {messageError && (
              <FormFieldMessageError>{upperFirst(messageError)}</FormFieldMessageError>
            )}
            {message && <FormFieldMessage>{upperFirst(message)}</FormFieldMessage>}
          </FormFieldMessages>
        )}
      </StyledFormField>
    );
  }
);
