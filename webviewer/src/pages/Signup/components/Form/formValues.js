import * as Yup from 'yup';
import { FIELD_VALIDATION } from '_constants';

export const validationSchema = Yup.object().shape({
  username: Yup.string().trim().required(FIELD_VALIDATION.REQUIRED),
  email: Yup.string().email().required(FIELD_VALIDATION.REQUIRED),
  password1: Yup.string()
    .trim()
    .min(8, FIELD_VALIDATION.PASSWORD)
    .required(FIELD_VALIDATION.REQUIRED),
  password2: Yup.string()
    .trim()
    .min(8, FIELD_VALIDATION.PASSWORD)
    .required(FIELD_VALIDATION.REQUIRED)
    .oneOf([Yup.ref('password1'), null], FIELD_VALIDATION.PASSWORD_MATCH)
});

export const _initialValues = {
  username: '',
  email: '',
  password1: '',
  password2: ''
};
