import React from "react";
import { Contact2 } from "lucide-react";

const ContactFormPlaceholder: React.FC = () => {
  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData("componentType", "contactForm");
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="h-14 w-14 bg-muted/70 rounded-md p-2 flex items-center justify-center cursor-grab"
    >
      <Contact2 className="w-10 h-10 text-muted-foreground" />
    </div>
  );
};

export default ContactFormPlaceholder;