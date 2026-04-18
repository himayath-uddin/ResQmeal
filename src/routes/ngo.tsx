import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/ngo")({
  component: LegacyNgoRoute,
});

function LegacyNgoRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/ngo-dashboard", replace: true });
  }, [navigate]);

  return null;
}
