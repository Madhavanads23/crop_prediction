import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, RefreshCw, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RefreshModalProps {
  isOpen: boolean;
  pageName: string;
  onStayOnPage: () => void;
  onGoHome: () => void;
}

export function RefreshModal({ isOpen, pageName, onStayOnPage, onGoHome }: RefreshModalProps) {
  // Handle keyboard events
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onStayOnPage();
      } else if (event.key === 'Enter') {
        onStayOnPage(); // Default action is to stay
      } else if (event.key === 'h' || event.key === 'H') {
        onGoHome(); // H for Home
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onStayOnPage, onGoHome]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={onStayOnPage} // Click backdrop to stay
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal
              className="w-full max-w-md"
            >
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-2xl">
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-full">
                      <RefreshCw className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="p-2 bg-emerald-100 rounded-full">
                      <Leaf className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <CardTitle className="text-green-900 text-xl">
                    Page Refreshed
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    Choose where you'd like to continue
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      Currently on: {pageName}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-700 text-center bg-white/80 p-4 rounded-lg border border-green-200 shadow-sm">
                    <p>🔄 You refreshed the page while viewing <strong className="text-green-800">{pageName}</strong>.</p>
                    <p className="mt-2 text-green-600">Where would you like to continue?</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-2">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={onStayOnPage}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12 shadow-lg"
                        size="lg"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Continue on {pageName}
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={onGoHome}
                        variant="outline"
                        className="w-full border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 h-12 shadow-sm"
                        size="lg"
                      >
                        <Home className="h-4 w-4 mr-2" />
                        Go to Home Page
                      </Button>
                    </motion.div>
                  </div>

                  <div className="text-xs text-gray-500 text-center pt-3 bg-gray-50/50 rounded-lg p-2 border border-gray-200">
                    <p>💡 <strong>Quick shortcuts:</strong> Press <kbd className="px-1 py-0.5 bg-white border rounded text-xs">ESC</kbd> to stay • <kbd className="px-1 py-0.5 bg-white border rounded text-xs">H</kbd> for home • Click outside to stay</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}