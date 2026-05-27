"use client";

import React from "react";
import { Button } from "~/components/ui/button";

const FILTERS = ["all", "published", "draft", "public", "unlisted"];

export function SearchFilters({
  active = "all",
  onChange,
}: {
  active?: string;
  onChange?: (f: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {FILTERS.map((f) => (
        <Button
          key={f}
          size="sm"
          variant={active === f ? "default" : "ghost"}
          onClick={() => onChange?.(f)}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </Button>
      ))}
    </div>
  );
}

export default SearchFilters;
