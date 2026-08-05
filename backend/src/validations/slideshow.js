import * as Yup from 'yup';


export const slideshowSchema = Yup.object({
    title: Yup.string()
        .trim()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title cannot exceed 100 characters')
        .required('Title is required'),

    description: Yup.string()
        .trim()
        .max(500, 'Description cannot exceed 500 characters')
        .nullable(),

    imageUrl: Yup.string()
        .url('Enter a valid image URL')
        .when('image', {
            is: (image) => !image,
            then: (schema) =>
                schema.required('Image URL or image upload is required'),
            otherwise: (schema) => schema.notRequired(),
        }),

    buttonText: Yup.string()
        .trim()
        .max(30, 'Button text cannot exceed 30 characters')
        .default('Book Now'),

    buttonLink: Yup.string()
        .trim()
        .required('Button link is required'),

    order: Yup.number()
        .integer('Order must be a whole number')
        .min(0, 'Order cannot be negative')
        .default(0),

    isActive: Yup.boolean()
        .default(true),
});

export const slideshowFileSchema = Yup.object({
    image: Yup.mixed()
        .test(
            'fileType',
            'Only JPG, PNG, and WEBP images are allowed',
            (file) => {
                if (!file) return true;

                return [
                    'image/jpeg',
                    'image/png',
                    'image/webp',
                ].includes(file.type);
            }
        )
        .test(
            'fileSize',
            'Image must be smaller than 5MB',
            (file) => {
                if (!file) return true;

                return file.size <= 5 * 1024 * 1024;
            }
        ),
});