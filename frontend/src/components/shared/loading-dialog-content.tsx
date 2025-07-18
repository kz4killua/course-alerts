import { DrawerDialog, DrawerDialogContent, DrawerDialogHeader, DrawerDialogTitle, DrawerDialogDescription } from "@/components/shared/drawer-dialog";
import { LoadingIcon } from "@/components/shared/loading-icon";


export function LoadingDialogContent() {
  return (
    <DrawerDialogContent>
      {/* A header is required for accessibility, but we hide it visually */}
      <div className="hidden">
        <DrawerDialogHeader>
          <DrawerDialogTitle>Loading...</DrawerDialogTitle>
          <DrawerDialogDescription>Loading...</DrawerDialogDescription>
        </DrawerDialogHeader>
      </div>
      <div className="pt-4 flex items-center justify-center">
        <LoadingIcon />
      </div>
    </DrawerDialogContent>
  );
}