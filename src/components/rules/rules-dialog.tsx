import rulesMarkdown from "./rules.md";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import markdownit from "markdown-it";
const rulesHtml = markdownit().render(rulesMarkdown);

export function RulesDialog({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="h-[60vh] overflow-hidden p-0 sm:max-w-[425px] [&>button:last-child]:hidden">
        <div className="flex flex-col overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>How to play</DialogTitle>
          </DialogHeader>
          <div
            className="rules-dialog flex max-w-none flex-col text-sm"
            dangerouslySetInnerHTML={{ __html: rulesHtml }}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button>Got it!</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
