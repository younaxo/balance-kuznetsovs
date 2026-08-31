"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ApplicationForm } from "./application-form";
import { useDialogs } from "@/components/dialogs/dialog-manager";
import { getServiceBySlug } from "@/domain/services";

export function ApplicationDialog() {
  const { applicationOpen, applicationServiceSlug, closeApplication } = useDialogs();
  const service = applicationServiceSlug ? getServiceBySlug(applicationServiceSlug) : undefined;

  return (
    <Dialog open={applicationOpen} onOpenChange={(open) => !open && closeApplication()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Оставить заявку</DialogTitle>
          <DialogDescription>
            {service
              ? `Услуга: ${service.title}. Оставьте контакты — мы свяжемся с вами.`
              : "Расскажите о задаче — мы свяжемся с вами удобным способом."}
          </DialogDescription>
        </DialogHeader>
        <ApplicationForm defaultServiceSlug={applicationServiceSlug} />
      </DialogContent>
    </Dialog>
  );
}
