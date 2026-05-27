"use client";

import React from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { GlareCard } from "~/components/ui/glare-card";

export function FormCard({ form, className }: { form: any; className?: string }) {
  const router = useRouter();
  const createdAt = form.createdAt ? format(new Date(form.createdAt), "PP") : "—";
  const updatedAt = form.updatedAt ? format(new Date(form.updatedAt), "PP") : "—";
  const closesAt = form.expiryTime ? format(new Date(form.expiryTime), "PP p") : "—";

  const openForm = () => {
    router.push(`/dashboard/forms/${form.id}`);
  };

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (target.closest("a,button,[role='button']")) {
      return;
    }

    openForm();
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openForm();
    }
  };

  return (
    <GlareCard
      className={className ?? "flex flex-col items-center justify-center p-5"}
      containerClassName="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div
        className="flex h-full flex-col items-center justify-center"
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        aria-label={`Open form ${form.title}`}
      >
        <svg
          width="66"
          height="65"
          viewBox="0 0 66 65"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7 text-white"
        >
          <path
            d="M8 8.05571C8 8.05571 54.9009 18.1782 57.8687 30.062C60.8365 41.9458 9.05432 57.4696 9.05432 57.4696"
            stroke="currentColor"
            strokeWidth="15"
            strokeMiterlimit="3.86874"
            strokeLinecap="round"
          />
        </svg>

        <p className="mt-4 line-clamp-1 max-w-full text-center text-xl font-bold text-white">
          {form.title}
        </p>

        <p className="mt-2 line-clamp-2 max-w-full text-center text-sm text-white/70">
          {form.description ?? "No description provided yet."}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Badge variant="secondary" className="rounded-full bg-white/15 text-white">
            Closes {closesAt}
          </Badge>
        </div>

        <div className="mt-4 grid w-full grid-cols-1 gap-2 text-left text-xs text-white/85">
          <div className="rounded-xl border border-white/20 bg-white/5 px-3 py-2">
            Created: <span className="font-semibold text-white">{createdAt}</span>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/5 px-3 py-2">
            Updated: <span className="font-semibold text-white">{updatedAt}</span>
          </div>
        </div>

        <div className="mt-4 flex w-full flex-col gap-2">
          <Button size="sm" asChild className="h-9 rounded-xl">
            <a href={`/dashboard/forms/${form.id}`}>Open form</a>
          </Button>
          <Button variant="secondary" size="sm" asChild className="h-9 rounded-xl">
            <a href={`/dashboard/responses?formId=${form.id}`}>View responses</a>
          </Button>
        </div>
      </div>
    </GlareCard>
  );
}

export default FormCard;
