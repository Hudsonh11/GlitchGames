import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import ThemePicker from '@/components/ThemePicker';

export default function ThemeMenu() {
  return <Dialog>
    <DialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Choose app theme" title="Choose app theme"><Palette /></Button></DialogTrigger>
    <DialogContent className="max-w-2xl w-[calc(100%-2rem)] max-h-[85dvh] overflow-y-auto rounded-lg">
      <DialogHeader><DialogTitle>Make it yours</DialogTitle><DialogDescription>Glitch Games · Appearance</DialogDescription></DialogHeader>
      <ThemePicker />
    </DialogContent>
  </Dialog>;
}