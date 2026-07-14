import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Participant, BillItem } from "@/lib/types";

interface ItemListProps {
  items: BillItem[];
  users: Participant[];
  onRemoveItem: (itemId: string) => void;
}

export default function ItemList({
  items,
  users,
  onRemoveItem,
}: ItemListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Split between</TableHead>
            <TableHead className="sr-only">Remove</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                ${item.cost.toFixed(2)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {item.quantity}
              </TableCell>
              <TableCell className="text-right font-mono font-semibold tabular-nums">
                ${(item.cost * item.quantity).toFixed(2)}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {item.users.map((userId) => {
                    const user = users.find((u) => u.id === userId);
                    return user ? (
                      <Badge
                        key={userId}
                        variant="secondary"
                        className="rounded-full"
                      >
                        {user.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${item.name}`}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
