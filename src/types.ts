export interface User {
  id: string;
  email: string;
  name: string;
  role: "contributor" | "procurement";
  avatar?: string;
}

export interface Listing {
  id: string;
  title: string;
  plasticType: string;
  quantity: number;
  pricePerKg: number;
  location: string;
  image?: string;
  description: string;
  contributorId: string;
  contributorName: string;
  status: "Available" | "Reserved" | "Sold";
  confidence?: number;
  condition?: string;
  recyclability?: string;
  createdAt: string;
}

export interface Request {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerId: string;
  buyerName: string;
  contributorId: string;
  quantity: number;
  offerPrice: number;
  status: "Pending" | "Accepted" | "Declined";
  createdAt: string;
}

export interface Order {
  id: string;
  requestId: string;
  listingId: string;
  listingTitle: string;
  buyerId: string;
  buyerName: string;
  contributorId: string;
  contributorName: string;
  quantity: number;
  totalAmount: number;
  status: "Pending" | "Accepted" | "Packed" | "Dispatched" | "Delivered" | "Completed";
  trackingHistory: { status: string; timestamp: string; note: string }[];
  createdAt: string;
}

export interface Message {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "request" | "order" | "chat" | "general";
  isRead: boolean;
  orderId?: string;
  createdAt: string;
}

export interface Innovation {
  id: string;
  title: string;
  description: string;
  materialsUsed: string[];
  steps: string[];
  authorName: string;
  authorId: string;
  createdAt: string;
}

export interface Certificate {
  id: string;
  code: string;
  companyName: string;
  plasticType: string;
  quantityVerified: number;
  issueDate: string;
  expiryDate: string;
  status: "Active" | "Verified" | "Expired";
}

export interface AnalyticsData {
  revenue: number;
  plasticTraded: number;
  ordersCount: number;
  co2Saved: number;
  distribution: { name: string; value: number }[];
  monthlyAnalytics: { month: string; recycled: number; co2: number; revenue: number }[];
  co2ApproximationSource: string;
}
