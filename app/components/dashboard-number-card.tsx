import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "../_helpers/_currency";

export function DashboardNumberCard({
  name,
  value,
  type,
  children,
}: {
  name: string;
  value?: number;
  type?: "positive" | "negative";
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{name}</CardDescription>
        {value !== undefined && (
          <CardTitle
            className={cn(
              "text-4xl",
              type === "negative"
                ? "text-red-400"
                : type === "positive"
                  ? "text-green-400"
                  : "",
            )}
          >
            {formatCurrency(value)}
          </CardTitle>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">{children}</div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
