import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string().trim().required('Email is required.').email('Enter a valid email.'),
  password: yup.string().trim().required('Password is required.').min(8, 'Password must be at least 8 characters.'),
});

export const registerSchema = yup.object({
  name: yup.string().trim().required('Full name is required.').min(2, 'Name is too short.'),
  email: yup.string().trim().required('Email is required.').email('Enter a valid email.'),
  password: yup.string().trim().required('Password is required.').min(8, 'Password must be at least 8 characters.'),
});
