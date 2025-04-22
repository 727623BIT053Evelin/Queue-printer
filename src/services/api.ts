
import { toast } from "sonner";

// Base URL for our API
const API_URL = 'https://api.example.com';

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  token?: string;
}

export interface Document {
  id: string;
  name: string;
  size: number;
  pages: number;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  createdAt: string;
  userId: string;
  queuePosition?: number;
  estimatedWaitTime?: number;
}

export interface QueueStats {
  totalInQueue: number;
  averagePrintTime: number;
  yourPosition?: number;
  estimatedTimeForYou?: number;
}

// For demo purposes, we'll simulate an API with localStorage
const users = JSON.parse(localStorage.getItem('users') || '[]');
const documents = JSON.parse(localStorage.getItem('documents') || '[]');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// Auth API
export const authApi = {
  register: async (username: string, email: string, password: string): Promise<User> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if user exists
      const existing = users.find((u: User) => u.email === email);
      if (existing) {
        throw new Error('User with this email already exists');
      }
      
      // Create user
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        email,
        token: 'token_' + Math.random().toString(36).substr(2, 9)
      };
      
      // Save to "database"
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Set current user
      currentUser = newUser;
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  login: async (email: string, password: string): Promise<User> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find user
      const user = users.find((u: User) => u.email === email);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // In a real app, you would validate the password here
      
      // Update user token
      user.token = 'token_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Set current user
      currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: async (): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Clear current user
    currentUser = null;
    localStorage.setItem('currentUser', 'null');
  },
  
  getCurrentUser: (): User | null => {
    return currentUser;
  }
};

// Document API
export const documentApi = {
  // Upload a document
  uploadDocument: async (file: File): Promise<Document> => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to upload documents');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create document
      const newDocument = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        pages: Math.floor(Math.random() * 5) + 1, // Random number of pages between 1-5
        status: 'pending',
        createdAt: new Date().toISOString(),
        userId: currentUser.id,
        queuePosition: documents.filter((d: Document) => d.status === 'pending').length + 1
      };
      
      // Save to "database"
      documents.push(newDocument);
      localStorage.setItem('documents', JSON.stringify(documents));
      
      // Show success notification
      toast.success("Document uploaded successfully");
      
      return newDocument;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload document");
      throw error;
    }
  },
  
  // Get user's documents
  getUserDocuments: async (): Promise<Document[]> => {
    if (!currentUser) {
      return [];
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter documents by user
    return documents
      .filter((d: Document) => d.userId === currentUser.id)
      .sort((a: Document, b: Document) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  // Get queue statistics
  getQueueStats: async (): Promise<QueueStats> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const pendingDocs = documents.filter((d: Document) => d.status === 'pending');
    
    // Calculate your position if logged in
    let yourPosition = null;
    let estimatedTimeForYou = null;
    
    if (currentUser) {
      const yourDocs = pendingDocs.filter((d: Document) => d.userId === currentUser.id);
      if (yourDocs.length > 0) {
        // Get your earliest submitted document position
        yourDocs.sort((a: Document, b: Document) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const earliestDoc = yourDocs[0];
        
        // Find position in queue
        yourPosition = pendingDocs.findIndex((d: Document) => d.id === earliestDoc.id) + 1;
        
        // Estimate wait time (3 minutes per document ahead of you)
        estimatedTimeForYou = yourPosition * 3;
      }
    }
    
    return {
      totalInQueue: pendingDocs.length,
      averagePrintTime: 3, // 3 minutes per document
      yourPosition,
      estimatedTimeForYou
    };
  },
  
  // Simulate document status updates (in a real app, this would be done by the server)
  simulateQueueProgress: () => {
    const pendingDocs = documents.filter((d: Document) => d.status === 'pending');
    
    if (pendingDocs.length > 0) {
      // Process the first document in the queue
      const docToProcess = pendingDocs[0];
      docToProcess.status = 'printing';
      
      // After some time, mark it as completed
      setTimeout(() => {
        docToProcess.status = 'completed';
        localStorage.setItem('documents', JSON.stringify(documents));
        
        // Send notification if it's the current user's document
        if (currentUser && docToProcess.userId === currentUser.id) {
          toast.success(`Your document "${docToProcess.name}" has been printed`);
        }
        
        // Process next document after a delay
        setTimeout(documentApi.simulateQueueProgress, 5000);
      }, 8000);
      
      localStorage.setItem('documents', JSON.stringify(documents));
    } else {
      // Check again after some time
      setTimeout(documentApi.simulateQueueProgress, 5000);
    }
  }
};

// Start the queue simulation
documentApi.simulateQueueProgress();
