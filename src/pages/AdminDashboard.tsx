
import React, { useEffect, useState } from "react";
import { documentApi, Document } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, User, Clock3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

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
          doc.status === "awaiting_confirmation" || doc.status === "pending"
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
        description: "The document has been confirmed and will be printed.",
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
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin" /></div>
          ) : docs.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No documents awaiting confirmation.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="py-2 px-2">Name</th>
                    <th className="py-2 px-2">User</th>
                    <th className="py-2 px-2">Pages</th>
                    <th className="py-2 px-2">Details</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2">Confirm Until</th>
                    <th className="py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc) => {
                    const isProcessing = processingIds.includes(doc.id);
                    return (
                      <tr key={doc.id} className="border-b">
                        <td className="py-2 px-2">{doc.name}</td>
                        <td className="py-2 px-2 flex items-center">
                          <User className="mr-1 h-4 w-4" /> {doc.userId}
                        </td>
                        <td className="py-2 px-2">{doc.pages}</td>
                        <td className="py-2 px-2">
                          {doc.printType === "single_side" ? "Single" : "Double"} /
                          {doc.colorType === "color" ? "Color" : "B&W"} <br />
                          {doc.paymentStatus === "paid" ? (
                            <span className="text-green-600">Paid</span>
                          ) : (
                            <span className="text-orange-600">To Pay</span>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          {doc.status === "awaiting_confirmation" ? (
                            <span className="text-amber-600">Awaiting Conf.</span>
                          ) : (
                            <span className="text-gray-500 capitalize">{doc.status}</span>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          {doc.status === "awaiting_confirmation" && doc.confirmationExpiry ? (
                            <span className="flex items-center text-blue-700 font-mono">
                              <Clock3 className="mr-1 h-4 w-4" />
                              {formatCountdown(doc.confirmationExpiry)}
                            </span>
                          ) : (
                            ""
                          )}
                        </td>
                        <td className="py-2 px-2 space-x-2">
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
                              onClick={() => handleConfirm(doc.id)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                "Mark as Present"
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

