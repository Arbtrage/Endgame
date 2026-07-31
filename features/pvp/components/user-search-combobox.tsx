"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "@/shared/api/fetcher";
import type { UserSearchResult } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

type UserSearchComboboxProps = {
  value: UserSearchResult | null;
  onChange: (user: UserSearchResult | null) => void;
};

export function UserSearchCombobox({ value, onChange }: UserSearchComboboxProps) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isFetching } = useQuery({
    queryKey: queryKeys.users.search(debounced),
    queryFn: () => searchUsers(debounced),
    enabled: debounced.length >= 2,
  });

  return (
    <div className="space-y-2">
      <Input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          if (!event.target.value.trim()) onChange(null);
        }}
        placeholder="Search by name or email…"
        autoComplete="off"
      />
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
          <Avatar className="size-8">
            <AvatarImage src={value.image ?? undefined} />
            <AvatarFallback>
              {(value.name ?? value.email).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{value.name ?? value.email}</p>
            <p className="truncate text-xs text-muted-foreground">{value.email}</p>
          </div>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              onChange(null);
              setQuery("");
            }}
          >
            Clear
          </button>
        </div>
      ) : null}
      {debounced.length >= 2 && !value ? (
        <ul className="max-h-48 overflow-y-auto rounded-lg border border-border/60 bg-card">
          {isFetching ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">Searching…</li>
          ) : results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">No users found</li>
          ) : (
            results.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted",
                  )}
                  onClick={() => {
                    onChange(user);
                    setQuery(user.name ?? user.email);
                  }}
                >
                  <Avatar className="size-8">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback>
                      {(user.name ?? user.email).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {user.name ?? user.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
