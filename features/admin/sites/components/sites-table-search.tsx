'use client'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

interface SitesTableSearchProps {
  value: string
  onValueChange: (value: string) => void
  suggestions: Array<{ id: string; siteName: string; clientLabel: string }>
  onSelect: (id: string) => void
}

export function SitesTableSearch({
  value,
  onValueChange,
  suggestions,
  onSelect,
}: SitesTableSearchProps) {
  return (
    <Command className="rounded-md border" shouldFilter={false} aria-label="Search sites">
      <CommandInput
        value={value}
        onValueChange={onValueChange}
        placeholder="Search by site name, client, or URL..."
        aria-label="Search sites"
      />
      <CommandList>
        <CommandEmpty>No sites found.</CommandEmpty>
        <CommandGroup heading="Matches">
          {suggestions.map((row) => (
            <CommandItem
              key={row.id}
              value={row.id}
              onSelect={() => onSelect(row.id)}
            >
              <div className="flex flex-col">
                <span className="font-medium">{row.siteName}</span>
                <span className="text-xs text-muted-foreground">
                  {row.clientLabel}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
