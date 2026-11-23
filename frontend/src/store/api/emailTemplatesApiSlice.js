import { apiSlice } from './apiSlice';

export const emailTemplatesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getEmailTemplates: builder.query({
            query: () => ({ url: '/email-templates' }),
            providesTags: (result) => result?.data
                ? [{ type: 'EmailTemplates', id: 'LIST' }, ...result.data.map((template) => ({ type: 'EmailTemplates', id: template.slug }))]
                : [{ type: 'EmailTemplates', id: 'LIST' }],
        }),
        getEmailTemplate: builder.query({
            query: (identifier) => ({ url: `/email-templates/${identifier}` }),
            providesTags: (_result, _error, identifier) => [{ type: 'EmailTemplates', id: identifier }],
        }),
        createEmailTemplate: builder.mutation({
            query: (body) => ({ url: '/email-templates', method: 'POST', data: body }),
            invalidatesTags: [{ type: 'EmailTemplates', id: 'LIST' }],
        }),
        updateEmailTemplate: builder.mutation({
            query: ({ identifier, ...body }) => ({ url: `/email-templates/${identifier}`, method: 'PUT', data: body }),
            invalidatesTags: (_result, _error, { identifier }) => [
                { type: 'EmailTemplates', id: 'LIST' },
                { type: 'EmailTemplates', id: identifier },
            ],
        }),
        deleteEmailTemplate: builder.mutation({
            query: (identifier) => ({ url: `/email-templates/${identifier}`, method: 'DELETE' }),
            invalidatesTags: (_result, _error, identifier) => [
                { type: 'EmailTemplates', id: 'LIST' },
                { type: 'EmailTemplates', id: identifier },
            ],
        }),
        previewEmailTemplate: builder.mutation({
            query: ({ identifier, ...body }) => ({ url: `/email-templates/${identifier}/preview`, method: 'POST', data: body }),
        }),
        resetEmailTemplate: builder.mutation({
            query: (identifier) => ({ url: `/email-templates/${identifier}/reset`, method: 'POST' }),
            invalidatesTags: (_result, _error, identifier) => [
                { type: 'EmailTemplates', id: 'LIST' },
                { type: 'EmailTemplates', id: identifier },
            ],
        }),
        sendEmailTemplateTest: builder.mutation({
            query: ({ identifier, ...body }) => ({ url: `/email-templates/${identifier}/test`, method: 'POST', data: body }),
        }),
    }),
});

export const {
    useGetEmailTemplatesQuery,
    useGetEmailTemplateQuery,
    useCreateEmailTemplateMutation,
    useUpdateEmailTemplateMutation,
    useDeleteEmailTemplateMutation,
    usePreviewEmailTemplateMutation,
    useResetEmailTemplateMutation,
    useSendEmailTemplateTestMutation,
} = emailTemplatesApiSlice;
