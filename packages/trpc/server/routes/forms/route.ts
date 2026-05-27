import { formService } from "../../services";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createFieldInputModel,
  createFieldOutputModel,
  createFormInputModel,
  createFormOutputModel,
  getFormByIdInputModel,
  getFormByIdOutputModel,
  deleteFieldInputModel,
  deleteFieldOutputModel,
  getFieldsInputModel,
  getFieldsOutputModel,
  listFormsInputModel,
  listFormsOutputModel,
  updateFieldInputModel,
  updateFieldOutputModel,
  createSubmissionInputModel,
  createSubmissionOutputModel,
} from "./model";

const TAGS = ["Form"];
const getPath = generatePath("/form");

export const formRouter = router({
  createForm: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createForm"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(createFormInputModel)
    .output(createFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { title, description, expiryTime, expiryDate } = input;
      const { id } = await formService.createForm({
        title,
        description,
        expiryTime,
        expiryDate,
        createdBy: ctx.user.id,
      });

      return { id };
    }),
  getFormById: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormById"),
        tags: TAGS,
      },
    })
    .input(getFormByIdInputModel)
    .output(getFormByIdOutputModel)
    .query(async ({ input }) => {
      const data = await formService.getFormById(input);

      return {
        form: {
          ...data.form,
          expiryTime: data.form.expiryTime.toISOString(),
          expiryDate: data.form.expiryDate.toISOString(),
          createdAt: data.form.createdAt?.toISOString() ?? null,
          updatedAt: data.form.updatedAt?.toISOString() ?? null,
        },
        fields: data.fields.map((field) => ({
          ...field,
          createdAt: field.createdAt?.toISOString() ?? null,
          updatedAt: field.updatedAt?.toISOString() ?? null,
        })),
      };
    }),
  createSubmission: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createSubmission"),
        tags: TAGS,
      },
    })
    .input(createSubmissionInputModel)
    .output(createSubmissionOutputModel)
    .mutation(async ({ input }) => {
      const { id } = await formService.createSubmission(input);
      return { id };
    }),
  listForms: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/listForms"),
        tags: TAGS,
      },
    })
    .input(listFormsInputModel)
    .output(listFormsOutputModel)
    .query(async ({ ctx }) => {
      const forms = await formService.listFormsByUserId({ userId: ctx.user.id });

      return forms.map((form) => ({
        ...form,
        expiryTime: form.expiryTime.toISOString(),
        expiryDate: form.expiryDate.toISOString(),
        createdBy: form.createdBy ?? ctx.user.id,
        createdAt: form.createdAt?.toISOString() ?? null,
        updatedAt: form.updatedAt?.toISOString() ?? null,
      }));
    }),
  createField: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createField"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(createFieldInputModel)
    .output(createFieldOutputModel)
    .mutation(async ({ input }) => {
      const { id } = await formService.createField(input);
      return { id };
    }),
  updateField: authenticatedProcedure
    .meta({
      openapi: {
        method: "PUT",
        path: getPath("/updateField"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(updateFieldInputModel)
    .output(updateFieldOutputModel)
    .mutation(async ({ input }) => {
      const { id } = await formService.updateField(input);
      return { id };
    }),
  deleteField: authenticatedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/deleteField"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(deleteFieldInputModel)
    .output(deleteFieldOutputModel)
    .mutation(async ({ input }) => {
      const { id } = await formService.deleteField(input);
      return { id };
    }),
  getFields: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFields"),
        tags: TAGS,
      },
    })
    .input(getFieldsInputModel)
    .output(getFieldsOutputModel)
    .query(async ({ input }) => {
      const fields = await formService.getFields(input);
      return fields.map((field) => ({
        ...field,
        createdAt: field.createdAt?.toISOString() ?? null,
        updatedAt: field.updatedAt?.toISOString() ?? null,
      }));
    }),
});
