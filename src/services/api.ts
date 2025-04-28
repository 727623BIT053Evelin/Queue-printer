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
  status: 'pending' | 'printing' | 'completed' | 'failed' | 'awaiting_confirmation' | 'skipped' | 'paid';
  createdAt: string;
  userId: string;
  queuePosition?: number;
  estimatedWaitTime?: number;
  paymentStatus?: 'unpaid' | 'paid';
  paymentAmount?: number;
  printType?: 'single_side' | 'double_side';
  colorType?: 'black_white' | 'color';
  confirmationRequired?: boolean;
  confirmationExpiry?: string;
}

export interface QueueStats {
  totalInQueue: number;
  averagePrintTime: number;
  yourPosition?: number;
  estimatedTimeForYou?: number;
}

export interface PrintPrice {
  single_side_bw: number;
  double_side_bw: number;
  single_side_color: number;
  double_side_color: number;
}

// For demo purposes, we'll simulate an API with localStorage
const users = JSON.parse(localStorage.getItem('users') || '[]');
const documents = JSON.parse(localStorage.getItem('documents') || '[]');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// Print prices in cents
const printPrices: PrintPrice = {
  single_side_bw: 50,    // $0.50 per page
  double_side_bw: 75,    // $0.75 per page
  single_side_color: 150, // $1.50 per page
  double_side_color: 200, // $2.00 per page
};

// Auth API
export const authApi = {
  register: async (username: string, email: string, password: string): Promise<User> => {
    if (!/@mcet\.in$/.test(email)) {
      throw new Error("Only mcet.in email addresses are allowed");
    }
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
    if (!/@mcet\.in$/.test(email)) {
      throw new Error("Only mcet.in email addresses are allowed");
    }
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
  uploadDocument: async (
    file: File, 
    printType: 'single_side' | 'double_side',
    colorType: 'black_white' | 'color',
    isPaid: boolean
  ): Promise<Document> => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to upload documents');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Random number of pages between 1-5
      const pageCount = 1; // Optionally randomize if needed
      
      // Calculate payment amount based on print options and page count
      let paymentAmount = 0;
      if (printType === 'single_side' && colorType === 'black_white') {
        paymentAmount = printPrices.single_side_bw * pageCount;
      } else if (printType === 'double_side' && colorType === 'black_white') {
        paymentAmount = printPrices.double_side_bw * pageCount;
      } else if (printType === 'single_side' && colorType === 'color') {
        paymentAmount = printPrices.single_side_color * pageCount;
      } else {
        paymentAmount = printPrices.double_side_color * pageCount;
      }
      
      // Create document
      const newDocument: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        pages: pageCount,
        status: isPaid ? 'paid' : 'pending',
        createdAt: new Date().toISOString(),
        userId: currentUser.id,
        queuePosition: documents.filter((d: Document) => 
          d.status === 'pending' || d.status === 'paid' || d.status === 'awaiting_confirmation'
        ).length + 1,
        paymentStatus: isPaid ? 'paid' : 'unpaid',
        paymentAmount: paymentAmount,
        printType: printType,
        colorType: colorType,
        confirmationRequired: !isPaid,
      };
      
      // Save to "database"
      documents.push(newDocument);
      localStorage.setItem('documents', JSON.stringify(documents));
      
      if (isPaid) toast.success("Payment done. Document in paid queue!");
      else toast.info("Pay at counter. Please be present for confirmation.");
      
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
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter documents by user
    return documents
      .filter((d: Document) => d.userId === currentUser.id)
      .sort((a: Document, b: Document) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  // Pay for a document
  payForDocument: async (documentId: string): Promise<Document> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const documentIndex = documents.findIndex((d: Document) => d.id === documentId);
      if (documentIndex === -1) {
        throw new Error('Document not found');
      }
      
      // Update document status
      documents[documentIndex].status = 'paid';
      documents[documentIndex].paymentStatus = 'paid';
      documents[documentIndex].confirmationRequired = false;
      
      // Update document in "database"
      localStorage.setItem('documents', JSON.stringify(documents));
      
      toast.success("Payment successful");
      
      return documents[documentIndex];
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Payment failed");
      throw error;
    }
  },
  
  // Confirm presence for printing
  confirmPresence: async (documentId: string): Promise<Document> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const documentIndex = documents.findIndex((d: Document) => d.id === documentId);
      if (documentIndex === -1) {
        throw new Error('Document not found');
      }
      
      // Update document status
      documents[documentIndex].status = 'pending';
      documents[documentIndex].confirmationRequired = false;
      
      // Update document in "database"
      localStorage.setItem('documents', JSON.stringify(documents));
      
      toast.success("Presence confirmed");
      
      return documents[documentIndex];
    } catch (error) {
      console.error('Confirmation error:', error);
      toast.error("Confirmation failed");
      throw error;
    }
  },
  
  // Skip a document due to no confirmation
  skipDocument: async (documentId: string): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const documentIndex = documents.findIndex((d: Document) => d.id === documentId);
      if (documentIndex === -1) {
        throw new Error('Document not found');
      }
      
      // Update document status
      documents[documentIndex].status = 'skipped';
      
      // Update document in "database"
      localStorage.setItem('documents', JSON.stringify(documents));
      
      // Update queue positions for remaining documents
      documents
        .filter(d => d.status === 'pending' || d.status === 'paid' || d.status === 'awaiting_confirmation')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .forEach((doc, index) => {
          doc.queuePosition = index + 1;
        });
      
      localStorage.setItem('documents', JSON.stringify(documents));
    } catch (error) {
      console.error('Skip error:', error);
      toast.error("Failed to skip document");
      throw error;
    }
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
    const pendingDocs = documents.filter((d: Document) => 
      (d.status === 'pending' || d.status === 'paid') && !d.confirmationRequired
    );
    
    if (pendingDocs.length > 0) {
      // Process the first document in the queue
      const docToProcess = pendingDocs[0];
      
      // If document requires physical presence and is not paid, request confirmation
      if (docToProcess.status === 'pending' && docToProcess.paymentStatus === 'unpaid') {
        docToProcess.status = 'awaiting_confirmation';
        docToProcess.confirmationRequired = true;
        docToProcess.confirmationExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes to confirm
        
        localStorage.setItem('documents', JSON.stringify(documents));
        
        // Notify user
        if (currentUser && docToProcess.userId === currentUser.id) {
          toast.info(`Your document "${docToProcess.name}" is ready to print. Please confirm your presence within 5 minutes.`);
        }
        
        // Check again after confirmation window
        setTimeout(() => {
          const docIndex = documents.findIndex(d => d.id === docToProcess.id);
          if (docIndex !== -1 && documents[docIndex].status === 'awaiting_confirmation') {
            // Skip if no confirmation
            documents[docIndex].status = 'skipped';
            localStorage.setItem('documents', JSON.stringify(documents));
            
            // Notify user
            if (currentUser && documents[docIndex].userId === currentUser.id) {
              toast.error(`Your document "${documents[docIndex].name}" was skipped due to no confirmation.`);
            }
            
            // Process next document
            setTimeout(documentApi.simulateQueueProgress, 2000);
          }
        }, 5 * 60 * 1000); // 5 minutes
        
        return;
      }
      
      // Normal printing process for paid or confirmed documents
      docToProcess.status = 'printing';
      
      // After some time, mark it as completed
      setTimeout(() => {
        docToProcess.status = 'completed';
        localStorage.setItem('documents', JSON.stringify(documents));
        
        // Send notification if it's the current user's document
        if (currentUser && docToProcess.userId === currentUser.id) {
          if (docToProcess.paymentStatus === 'paid') {
            toast.success(`Your document "${docToProcess.name}" has been printed and is ready for collection.`);
          } else {
            toast.success(`Your document "${docToProcess.name}" has been printed.`);
          }
        }
        
        // Process next document after a delay
        setTimeout(documentApi.simulateQueueProgress, 5000);
      }, 8000);
      
      localStorage.setItem('documents', JSON.stringify(documents));
    } else {
      // Check again after some time
      setTimeout(documentApi.simulateQueueProgress, 5000);
    }
  },
  
  // Get print prices
  getPrintPrices: (): PrintPrice => {
    return printPrices;
  },

  // ADMIN ONLY: Get all documents, real-time (used in AdminDashboard)
  getAllDocuments: async (): Promise<Document[]> => {
    // Simulate API call delay
    await new Promise((res) => setTimeout(res, 500));
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    return documents.sort((a: Document, b: Document) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  clearAllDocuments: async (): Promise<void> => {
    // Clear all documents from local storage
    localStorage.setItem('documents', JSON.stringify([]));
  },
};

// Start the queue simulation
documentApi.simulateQueueProgress();
