import type { Metadata } from "next";
import FleetRouteClient from "@/app/fleet/FleetRouteClient";

export const metadata: Metadata = {
  title: "Fleet",
};

export default function FleetRoute() {
  return <FleetRouteClient />;
}