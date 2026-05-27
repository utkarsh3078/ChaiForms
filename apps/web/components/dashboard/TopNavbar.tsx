"use client";

import React from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { IconBell, IconPlus, IconSearch } from "@tabler/icons-react";
import { cn } from "~/lib/utils";

export function TopNavbar({ className }: { className?: string }) {
  return (
    <div className={cn("sticky top-0 z-20 border-b bg-background/60 backdrop-blur-sm", className)}>
      <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 py-3">
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex items-center w-full max-w-lg">
            <IconSearch className="absolute left-3 text-muted-foreground size-4" />
            <Input className="pl-10 pr-3" placeholder="Search forms, responses, templates..." />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              <IconBell />
            </Button>
            <Button size="sm" className="flex items-center" variant="default">
              <IconPlus />
              <span className="ml-2 hidden sm:inline">Create</span>
            </Button>
            <Avatar>
              <AvatarImage src="/avatars/user.png" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopNavbar;
