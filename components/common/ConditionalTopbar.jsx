"use client";

import { usePathname } from "next/navigation";
import Topbar from "@/components/headers/Topbar";

const HIDE_TOPBAR_PATHS = ["/odeme"];

export default function ConditionalTopbar({ data, isActive }) {
  const pathname = usePathname();
  const hideTopbar = HIDE_TOPBAR_PATHS.some((path) => pathname === path);

  if (hideTopbar) return null;

  return <Topbar data={data} isActive={isActive} />;
}
