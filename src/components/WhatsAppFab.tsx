import { MessageCircle } from "lucide-react";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export function WhatsAppFab() {
  return (
    <WhatsAppButton className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent shadow-glow flex items-center justify-center hover:shadow-neon transition-shadow">
      <MessageCircle className="w-6 h-6 text-primary-foreground" />
    </WhatsAppButton>
  );
}
