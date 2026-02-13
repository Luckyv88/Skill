"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import CallPageContent from "./CallPageContent";

export default function CallPage() {
  return (
    <Suspense fallback={<div>Loading call...</div>}>
      <CallPageContent />
    </Suspense>
  );
}
