import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/unauthorized")({
  ssr: false,
  component: () => (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold">Unauthorized</h1>
        <p className="mt-2 text-sm text-muted-foreground">You don't have permission to access this page.</p>
        <Link to="/"><Button className="mt-6">Go home</Button></Link>
      </div>
    </div>
  ),
});