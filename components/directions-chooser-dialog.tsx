"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MAP_APPS, openWithMapApp } from "@/lib/directions";
import { useLanguage } from "@/components/language-provider";

interface DirectionsChooserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  latitude: number;
  longitude: number;
}

export function DirectionsChooserDialog({ open, onOpenChange, latitude, longitude }: DirectionsChooserDialogProps) {
  const { t } = useLanguage();

  const availableApps = MAP_APPS.filter((app) => app.canOpen());

  const handleSelectApp = (app: (typeof MAP_APPS)[0]) => {
    openWithMapApp(app, latitude, longitude);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[300px]">
        <DialogHeader>
          <DialogTitle>{t.getDirections}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {availableApps.map((app) => (
            <Button key={app.id} variant="outline" className="justify-start p-6" onClick={() => handleSelectApp(app)}>
              <span className="mr-2">{app.icon}</span>
              {app.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
