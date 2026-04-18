import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/donate")({
  component: LegacyDonateRoute,
});

function LegacyDonateRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/donor-dashboard", replace: true });
  }, [navigate]);

  return null;
}
