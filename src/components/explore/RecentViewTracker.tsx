// components/RecentViewTracker.tsx
"use client";

import { useEffect } from "react";
import { addRecentId } from "@/utils/recent-storage";

export default function RecentViewTracker(props: { assetId: string }) {
  useEffect(() => {
    if (!props.assetId) return;
    addRecentId(props.assetId);
  }, [props.assetId]);

  return null;
}