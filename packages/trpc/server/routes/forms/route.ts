import { formService } from "../../services";
import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createFormInputModel,
  createFormOutputModel,
  listFormsInputModel,
  listFormsOutputModel,
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
});
