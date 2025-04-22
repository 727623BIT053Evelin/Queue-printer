
import React, { useEffect, useState } from "react";
import { documentApi, Document } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, User } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    setLoading(true);
    const allDocs = await documentApi.getAllDocuments?.();
    if (allDocs) {
      setDocs(allDocs.filter(doc =>
        (doc.status === "awaiting_confirmation" || doc.status === "pending")
      ));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
    const intervalId = setInterval(fetchDocs, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleConfirm = async (docId: string) => {
    await documentApi.confirmPresence(docId);
    fetchDocs();
  };

  const handleSkip = async (docId: string) => {
    await documentApi.skipDocument(docId);
    fetchDocs();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard - Printing Queue</CardTitle>
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
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc) => (
                    <tr key={doc.id} className="border-b">
                      <td className="py-2 px-2">{doc.name}</td>
                      <td className="py-2 px-2 flex items-center"><User className="mr-1 h-4 w-4" />{doc.userId}</td>
                      <td className="py-2 px-2">{doc.pages}</td>
                      <td className="py-2 px-2">
                        {doc.status === "awaiting_confirmation" ? (
                          <span className="text-amber-600">Awaiting Confirmation</span>
                        ) : (
                          <span className="text-gray-500">{doc.status}</span>
                        )}
                      </td>
                      <td className="py-2 px-2 space-x-2">
                        {doc.status === "awaiting_confirmation" && (
                          <>
                            <Button size="sm" onClick={() => handleConfirm(doc.id)}>
                              Confirm & Print
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleSkip(doc.id)}>
                              Skip
                            </Button>
                          </>
                        )}
                        {doc.status === "pending" && (
                          <Button size="sm" onClick={() => handleConfirm(doc.id)}>
                            Mark as Present
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
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
