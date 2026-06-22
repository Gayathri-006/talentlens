import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {description ?? "This module is part of the upcoming phase. The frontend is wired and ready to connect to your backend endpoints."}
        </p>
      </CardContent>
    </Card>
  );
}