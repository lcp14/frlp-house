import { Badge } from "@/components/ui/badge";
import { XIcon } from "lucide-react";

export default function Tag({ tag, onRemove }: { tag: any; onRemove?: any }) {
  return (
    <Badge className="space-x-1" variant={"secondary"}>
      <span> {tag.text} </span>
      <XIcon
        className="rounded-md transition-all hover:cursor-pointer hover:bg-red-500"
        size={12}
        onClick={onRemove}
      />
    </Badge>
  );
}
