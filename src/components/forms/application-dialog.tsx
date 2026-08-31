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
import type { ServiceOption } from "@/server/services/options";

export function ApplicationDialog({ services }: { services: ServiceOption[] }) {
  const { applicationOpen, applicationServiceSlug, closeApplication } = useDialogs();
  const service = services.find((s) => s.slug === applicationServiceSlug);

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
        <ApplicationForm defaultServiceSlug={applicationServiceSlug} services={services} />
      </DialogContent>
    </Dialog>
  );
}
