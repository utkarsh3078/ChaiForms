"use client";
import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useState } from "react";
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
import { useForm } from "react-hook-form";
import { useCreateForm, useListForms } from "~/hooks/api/form";

export default function Page() {
  const [open, setOpen] = useState(false);
  const { forms, isLoading: isFormsLoading, error: formsError } = useListForms();
  const { createFormAsync, error, status } = useCreateForm();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { title: "", description: "", expiryDate: "", expiryTime: "" },
  });

  const onSubmit = async (values: any) => {
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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6">
          <Card className="max-w-3xl">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1.5">
                <CardTitle>Forms</CardTitle>
                <CardDescription>
                  Build, organize, and publish forms from this workspace.
                </CardDescription>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>Create Form</Button>
                </DialogTrigger>
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
                          maxLength: { value: 60, message: "Title must be 60 characters or less" },
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
                          {...register("expiryDate", { required: "Expiry date is required" })}
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
                          {...register("expiryTime", { required: "Expiry time is required" })}
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
                      <Button type="submit" disabled={status === "pending"}>
                        {status === "pending" ? "Creating..." : "Create form"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Create a new form from the button above and open any form to continue building it.
                </p>

                {formsError ? (
                  <p className="text-sm text-destructive">{formsError.message}</p>
                ) : null}

                {isFormsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading forms...</p>
                ) : forms && forms.length > 0 ? (
                  <div className="grid gap-3">
                    {forms.map((form) => (
                      <Card key={form.id} className="border-dashed">
                        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-1">
                            <h3 className="font-medium leading-none">{form.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {form.description ?? "No description provided"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Created{" "}
                              {form.createdAt
                                ? new Date(form.createdAt).toLocaleString()
                                : "just now"}
                            </p>
                          </div>

                          <Button asChild variant="outline">
                            <a href={`/dashboard/forms/${form.id}`}>See form</a>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    No forms yet. Create your first one to start building.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
