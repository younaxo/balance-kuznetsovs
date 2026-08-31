"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Quiz } from "./quiz";
import { useDialogs } from "@/components/dialogs/dialog-manager";

export function QuizDialog() {
  const { quizOpen, closeQuiz } = useDialogs();

  return (
    <Dialog open={quizOpen} onOpenChange={(open) => !open && closeQuiz()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Рассчитать стоимость</DialogTitle>
          <DialogDescription>
            Несколько вопросов о задаче — точную стоимость определим после анализа и свяжемся с
            вами.
          </DialogDescription>
        </DialogHeader>
        <Quiz onDone={closeQuiz} />
      </DialogContent>
    </Dialog>
  );
}
