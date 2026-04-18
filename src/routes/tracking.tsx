import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/tracking")({
  component: LegacyTrackingRoute,
});

function LegacyTrackingRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/map", replace: true });
  }, [navigate]);

  return null;
}
