"use client";

import * as React from "react";
import IconButton from "./IconButton";
import { Trash2 } from "lucide-react";

type Props = Omit<
  React.ComponentProps<typeof IconButton>,
  "children" | "intent"
> & {
  "aria-label"?: string;
  title?: string;
};

export default function TrashButton({ ...rest }: Props) {
  return (
    <IconButton
      intent="danger"
      aria-label="Delete"
      title="Delete"
      {...rest}
      // lighter neutral hover (per request); keep icon danger color
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor =
          "color-mix(in oklab, var(--twc-text) 4%, var(--twc-surface))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--twc-surface)";
      }}
    >
      <Trash2 className="h-4 w-4" />
    </IconButton>
  );
}
