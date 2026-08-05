import * as yup from 'yup';

export const validateForm = async (schema, values) => {
  try {
    const validated = await schema.validate(values, {
      abortEarly: false,
      stripUnknown: false,
    });

    return { valid: true, values: validated, errors: {} };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors = {};

      error.inner.forEach((issue) => {
        const key = issue.path || 'form';
        errors[key] = issue.message;
      });

      return { valid: false, values: {}, errors };
    }

    return { valid: false, values: {}, errors: { form: error.message || 'Validation failed.' } };
  }
};
