"use client";

import { type ReactElement, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useCreateForm } from "~/hooks/api/form";

type CreateFormValues = {
  title: string;
  description: string;
  expiryDate: string;
  expiryTime: string;
};

export function CreateFormDialog({
  trigger,
  defaultOpen = false,
}: {
  trigger: ReactElement;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { createFormAsync, error, status } = useCreateForm();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateFormValues>({
    defaultValues: {
      title: "",
      description: "",
      expiryDate: "",
      expiryTime: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  const onSubmit = async (values: CreateFormValues) => {
    const expiryDate = new Date(`${values.expiryDate}T00:00:00`);
    const expiryTime = new Date(`${values.expiryDate}T${values.expiryTime}:00`);

    await createFormAsync({
      title: values.title,
      description: values.description.trim() || undefined,
      expiryDate,
      expiryTime,
    });

    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-135">
        <DialogHeader>
          <DialogTitle>Create a new form</DialogTitle>
          <DialogDescription>
            Set the title, optional description, and expiry schedule for your form.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="title">
              Title
            </label>
            <Input
              id="title"
              placeholder="Customer feedback"
              {...register("title", {
                required: "Title is required",
                maxLength: {
                  value: 60,
                  message: "Title must be 60 characters or less",
                },
              })}
            />
            {errors.title ? (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="description">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Tell people what this form is for"
              className="min-h-24"
              {...register("description", {
                maxLength: {
                  value: 500,
                  message: "Description must be 500 characters or less",
                },
              })}
            />
            {errors.description ? (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="expiryDate">
                Expiry date
              </label>
              <Input
                id="expiryDate"
                type="date"
                {...register("expiryDate", {
                  required: "Expiry date is required",
                })}
              />
              {errors.expiryDate ? (
                <p className="text-sm text-destructive">{errors.expiryDate.message}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="expiryTime">
                Expiry time
              </label>
              <Input
                id="expiryTime"
                type="time"
                {...register("expiryTime", {
                  required: "Expiry time is required",
                })}
              />
              {errors.expiryTime ? (
                <p className="text-sm text-destructive">{errors.expiryTime.message}</p>
              ) : null}
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error.message}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={status === "pending" || !isValid}>
              {status === "pending" ? "Creating..." : "Create form"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateFormDialog;
