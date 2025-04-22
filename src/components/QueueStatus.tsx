
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { documentApi, QueueStats } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Users, Printer } from 'lucide-react';

const QueueStatus: React.FC = () => {
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchQueueStats = async () => {
      try {
        const stats = await documentApi.getQueueStats();
        setQueueStats(stats);
      } catch (error) {
        console.error('Failed to fetch queue stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueueStats();
    
    // Set up polling to update queue stats
    const intervalId = setInterval(fetchQueueStats, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-2">
            <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Printer className="mr-2 h-5 w-5 text-primary" />
          Queue Status
        </CardTitle>
        <CardDescription>
          Real-time printer queue information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-secondary" />
              <span className="text-sm font-medium">People in queue:</span>
            </div>
            <span className="font-bold text-lg">
              {queueStats?.totalInQueue || 0}
            </span>
          </div>
          
          {queueStats?.yourPosition && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Your position:</span>
                <span className="font-bold">{queueStats.yourPosition} of {queueStats.totalInQueue}</span>
              </div>
              <Progress value={(queueStats.yourPosition / queueStats.totalInQueue) * 100} className="h-2" />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-secondary" />
              <span className="text-sm font-medium">Average print time:</span>
            </div>
            <span className="font-medium">{queueStats?.averagePrintTime || 0} minutes per document</span>
          </div>
          
          {queueStats?.estimatedTimeForYou && (
            <div className="bg-primary/10 p-4 rounded-lg mt-4">
              <h4 className="font-medium text-primary mb-1">Your estimated wait time</h4>
              <p className="text-xl font-bold">
                {queueStats.estimatedTimeForYou > 60 
                  ? `${Math.floor(queueStats.estimatedTimeForYou / 60)} hr ${queueStats.estimatedTimeForYou % 60} min` 
                  : `${queueStats.estimatedTimeForYou} min`
                }
              </p>
            </div>
          )}
          
          {!user && (
            <div className="bg-muted/50 p-4 rounded-lg mt-2">
              <p className="text-sm text-muted-foreground">
                Sign in to see your position in queue and get notifications
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QueueStatus;
