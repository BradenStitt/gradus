import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Expand, Loader2 } from "lucide-react";
import SimpleBar from "simplebar-react";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";
import { Document, Page } from "react-pdf";

interface PdfFullscreenProps {
  url: string;
}

function PdfFullscreen({ url }: PdfFullscreenProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [numPages, setNumPages] = useState<number>();

  const { toast } = useToast();

  const { width, ref } = useResizeDetector();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(visibility) => {
        if (!visibility) setIsOpen(visibility);
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button variant="ghost" className="gap-1.5" aria-label="fullscreen">
          <Expand className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-full">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)] mt-6">
          <div ref={ref}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin " />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: "Error Loading PDF",
                  description: "Please try again later.",
                  variant: "destructive",
                });
              }}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              file={url}
              className="max-h-full"
            >
              {
                // Create a new array with a length of 'numPages'
                new Array(numPages)
                  // Fill the array with zeros (the actual values don't matter in this case)
                  .fill(0)
                  // Map over each element in the array
                  .map((_, i) => (
                    // For each element, create a React 'Page' component
                    <Page
                      key={i}
                      pageNumber={i + 1}
                      width={width ? width : 1}
                    />
                  ))
              }
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
}

export default PdfFullscreen;
