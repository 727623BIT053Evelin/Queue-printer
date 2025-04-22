
import React from 'react';
import NavBar from '@/components/NavBar';
import QueueStatus from '@/components/QueueStatus';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FileUp, Clock, Info } from 'lucide-react';

const QueuePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Printer Queue Status</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <QueueStatus />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="mr-2 h-5 w-5 text-primary" />
                  Queue Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Clock className="h-4 w-4 mr-2 mt-1 text-secondary" />
                    <span>Peak times are typically right before exams. Plan ahead!</span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="h-4 w-4 mr-2 mt-1 text-secondary" />
                    <span>Each document takes approximately 3 minutes to print.</span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="h-4 w-4 mr-2 mt-1 text-secondary" />
                    <span>You will receive a notification when your print job is complete.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileUp className="mr-2 h-5 w-5 text-primary" />
                  Upload Document
                </CardTitle>
                <CardDescription>
                  Ready to add your document to the queue?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload your document remotely and skip the physical line.
                  </p>
                  
                  {!user ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        You need to sign in to upload documents.
                      </p>
                      <div className="flex space-x-3">
                        <Link to="/login">
                          <Button variant="outline" size="sm">Sign In</Button>
                        </Link>
                        <Link to="/register">
                          <Button size="sm">Sign Up</Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <Link to="/upload">
                      <Button className="w-full">Upload Now</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueuePage;
