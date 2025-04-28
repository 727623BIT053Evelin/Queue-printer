import React, { useEffect, useState } from "react";
import { documentApi, Document } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, User, Clock3, Printer, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatCountdown(expiry: string) {
  const end = new Date(expiry).getTime();
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return [
    h > 0 ? String(h).padStart(2, "0") : "00",
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0"),
  ].join(":");
}

function formatCreatedTime(createdAt: string) {
  const date = new Date(createdAt);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getEstimatedPrintTime(queuePosition: number = 1): string {
  const minutes = queuePosition * 2;
  return `~${minutes} min${minutes !== 1 ? 's' : ''}`;
}

const AdminDashboard: React.FC = () => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const { role, user } = useAuth();
  const [, setNow] = useState(Date.now()); // Dummy state to force interval re-render

  const fetchDocs = async () => {
    setLoading(true);
    const allDocs = await documentApi.getAllDocuments?.();
    if (allDocs) {
      setDocs(
        allDocs.filter(doc =>
          doc.status === "awaiting_confirmation" || 
          doc.status === "pending" ||
          doc.status === "printing"
        )
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    if (role !== "admin") return;
    fetchDocs();
    const intervalId = setInterval(fetchDocs, 5000);
    const countdownInterval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(intervalId);
      clearInterval(countdownInterval);
    };
  }, [role]);

  const handleConfirm = async (docId: string) => {
    try {
      setProcessingIds(prev => [...prev, docId]);
      await documentApi.confirmPresence(docId);
      toast({
        title: "Document confirmed",
        description: "The document has been confirmed and is now in the print queue.",
        variant: "default"
      });
      
      setDocs(docs.filter(doc => doc.id !== docId));
      
      setTimeout(fetchDocs, 1000);
    } catch (error) {
      toast({
        title: "Confirmation failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== docId));
    }
  };

  const handleSkip = async (docId: string) => {
    try {
      setProcessingIds(prev => [...prev, docId]);
      await documentApi.skipDocument(docId);
      toast({
        title: "Document skipped",
        description: "The document has been skipped and removed from the queue.",
        variant: "default"
      });
      setDocs(docs.filter(doc => doc.id !== docId));
      setTimeout(fetchDocs, 1000);
    } catch (error) {
      toast({
        title: "Skip failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== docId));
    }
  };

  const handleForcePrint = async (docId: string) => {
    try {
      setProcessingIds(prev => [...prev, docId]);
      await documentApi.confirmPresence(docId);
      documentApi.simulateQueueProgress();
      toast({
        title: "Print initiated",
        description: "The document has been sent to the printer.",
        variant: "default"
      });
      setDocs(docs.filter(doc => doc.id !== docId));
      setTimeout(fetchDocs, 1000);
    } catch (error) {
      toast({
        title: "Print failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== docId));
    }
  };

  const handleReset = async () => {
    await documentApi.clearAllDocuments(); // Clear all documents from local storage
    setDocs([]); // Clear the document list in the state
    setProcessingIds([]); // Clear any processing states
    fetchDocs(); // Reload the documents
  };

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-xl font-semibold text-gray-600">
        <Card>
          <CardHeader>
            <CardTitle>Forbidden</CardTitle>
          </CardHeader>
          <CardContent>
            You are not authorized to view this page.
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedDocs = [...docs].sort((a, b) => {
    if (a.status === 'printing' && b.status !== 'printing') return -1;
    if (a.status !== 'printing' && b.status === 'printing') return 1;
    if (a.status === 'awaiting_confirmation' && b.status !== 'awaiting_confirmation') return -1;
    if (a.status !== 'awaiting_confirmation' && b.status === 'awaiting_confirmation') return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard - Printing Queue</CardTitle>
          <div className="mt-1 text-sm text-muted-foreground">
            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded mr-3">Admin-only</span>
            <span className="bg-blue-50 text-blue-800 px-2 py-1 rounded">
              <b>How to use 'Skip'?</b> Use <b>Skip</b> to move forward in the queue if a student is not physically present for confirmation (no show).
            </span>
            <span className="ml-3 bg-green-50 text-green-800 px-2 py-1 rounded">
              <b>Print Time:</b> Each document takes approximately 2 minutes to print.
            </span>
          </div>
          <Button className="mt-4" variant="outline" onClick={handleReset}>
            Reset Dashboard
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin" /></div>
          ) : docs.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No documents awaiting confirmation or printing.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Pages</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confirm Until</TableHead>
                    <TableHead>Time Added</TableHead>
                    <TableHead>Est. Print Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDocs.map((doc, index) => {
                    const isProcessing = processingIds.includes(doc.id);
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.name}</TableCell>
                        <TableCell className="flex items-center">
                          <User className="mr-1 h-4 w-4" /> {doc.userId}
                        </TableCell>
                        <TableCell>{doc.pages}</TableCell>
                        <TableCell>
                          {doc.printType === "single_side" ? "Single" : "Double"} /
                          {doc.colorType === "color" ? "Color" : "B&W"} <br />
                          {doc.paymentStatus === "paid" ? (
                            <span className="text-green-600">Paid</span>
                          ) : (
                            <span className="text-orange-600">To Pay</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {doc.status === "awaiting_confirmation" ? (
                            <span className="text-amber-600">Awaiting Conf.</span>
                          ) : doc.status === "printing" ? (
                            <span className="text-blue-600 flex items-center">
                              <Printer className="mr-1 h-4 w-4 animate-pulse" /> Printing...
                            </span>
                          ) : (
                            <span className="text-gray-500 capitalize">{doc.status}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {doc.status === "awaiting_confirmation" && doc.confirmationExpiry ? (
                            <span className="flex items-center text-blue-700 font-mono">
                              <Clock3 className="mr-1 h-4 w-4" />
                              {formatCountdown(doc.confirmationExpiry)}
                            </span>
                          ) : (
                            ""
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono">{formatCreatedTime(doc.createdAt)}</span>
                        </TableCell>
                        <TableCell>
                          {doc.status === "pending" || doc.status === "awaiting_confirmation" ? (
                            <span className="text-blue-600">
                              {getEstimatedPrintTime(index + 1)}
                            </span>
                          ) : doc.status === "printing" ? (
                            <span className="text-green-600">In progress</span>
                          ) : (
                            ""
                          )}
                        </TableCell>
                        <TableCell className="space-x-2">
                          {doc.status === "awaiting_confirmation" && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleConfirm(doc.id)}
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  "Confirm & Print"
                                )}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleSkip(doc.id)}
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  "Skip"
                                )}
                              </Button>
                            </>
                          )}
                          {doc.status === "pending" && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleForcePrint(doc.id)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Printer className="mr-1 h-4 w-4" />
                                  Print Now
                                </>
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
