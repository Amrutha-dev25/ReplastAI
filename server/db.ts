import fs from "fs";
import path from "path";

// Define the data folder and file path
const DATA_DIR = path.join(process.cwd(), "server", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "contributor" | "procurement";
  avatar?: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  plasticType: string;
  quantity: number; // in kg
  pricePerKg: number; // in USD or local currency
  location: string;
  image?: string;
  description: string;
  contributorId: string;
  contributorName: string;
  status: "Available" | "Reserved" | "Sold";
  confidence?: number; // CV confidence
  condition?: string; // Clean, dirty, etc.
  recyclability?: string; // High, medium, low
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

interface DatabaseSchema {
  users: User[];
  listings: Listing[];
  requests: Request[];
  orders: Order[];
  messages: Message[];
  notifications: Notification[];
  innovations: Innovation[];
  certificates: Certificate[];
}

class LocalDB {
  private data: DatabaseSchema = {
    users: [],
    listings: [],
    requests: [],
    orders: [],
    messages: [],
    notifications: [],
    innovations: [],
    certificates: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
      } else {
        this.seed();
        this.save();
      }
    } catch (error) {
      console.error("Failed to initialize database, resetting to empty", error);
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (error) {
      console.error("Failed to write to local database file", error);
    }
  }

  private seed() {
    // Seed initial users
    this.data.users = [
      {
        id: "user-contributor-1",
        email: "contributor@replast.com",
        passwordHash: "password123", // Simplified hashing for local dev
        name: "Eco Collector Co.",
        role: "contributor",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        createdAt: new Date().toISOString(),
      },
      {
        id: "user-procurement-1",
        email: "buyer@replast.com",
        passwordHash: "password123",
        name: "Green Polymers Ltd.",
        role: "procurement",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        createdAt: new Date().toISOString(),
      },
    ];

    // Seed initial listings
    this.data.listings = [
      {
        id: "list-1",
        title: "Sorted Clean PET Bottles",
        plasticType: "PET (Type 1)",
        quantity: 1200,
        pricePerKg: 0.85,
        location: "Seattle, WA",
        description: "Post-consumer beverage bottles. Caps removed, thoroughly washed, shredded into medium flakes.",
        contributorId: "user-contributor-1",
        contributorName: "Eco Collector Co.",
        status: "Available",
        confidence: 0.96,
        condition: "Clean / Flakes",
        recyclability: "High",
        image: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=600",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "list-2",
        title: "Industrial HDPE Crates",
        plasticType: "HDPE (Type 2)",
        quantity: 2500,
        pricePerKg: 1.10,
        location: "Portland, OR",
        description: "Heavy-duty logistics crates, crushed. Uniform blue material, excellent polymer stability for manufacturing extrusion.",
        contributorId: "user-contributor-1",
        contributorName: "Eco Collector Co.",
        status: "Available",
        confidence: 0.98,
        condition: "Crushed Crates",
        recyclability: "High",
        image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "list-3",
        title: "Mixed PP Food Containers",
        plasticType: "PP (Type 5)",
        quantity: 800,
        pricePerKg: 0.65,
        location: "San Jose, CA",
        description: "Sourced from household food packaging. Washed, caps and adhesive labels removed. Ready for pelletization.",
        contributorId: "user-contributor-1",
        contributorName: "Eco Collector Co.",
        status: "Available",
        confidence: 0.92,
        condition: "Baled Packs",
        recyclability: "Medium",
        image: "https://images.unsplash.com/photo-1605600611280-2a1b39741a6a?auto=format&fit=crop&q=80&w=600",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Seed requests
    this.data.requests = [
      {
        id: "req-1",
        listingId: "list-1",
        listingTitle: "Sorted Clean PET Bottles",
        buyerId: "user-procurement-1",
        buyerName: "Green Polymers Ltd.",
        contributorId: "user-contributor-1",
        quantity: 1200,
        offerPrice: 0.80,
        status: "Pending",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Seed initial orders
    this.data.orders = [
      {
        id: "ord-1",
        requestId: "req-legacy",
        listingId: "list-legacy",
        listingTitle: "LDPE Clear Film Scrap",
        buyerId: "user-procurement-1",
        buyerName: "Green Polymers Ltd.",
        contributorId: "user-contributor-1",
        contributorName: "Eco Collector Co.",
        quantity: 1800,
        totalAmount: 1620, // 1800 * 0.90
        status: "Dispatched",
        trackingHistory: [
          { status: "Pending", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), note: "Order placed from request acceptance" },
          { status: "Accepted", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), note: "Contributor confirmed collection and dispatch details" },
          { status: "Packed", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), note: "Material sorted, packed into standard super-sacks, labeled" },
          { status: "Dispatched", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), note: "Shipped via regional freight. Tracking ID: RP-908123" },
        ],
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Seed messages
    this.data.messages = [
      {
        id: "msg-1",
        orderId: "ord-1",
        senderId: "user-procurement-1",
        senderName: "Green Polymers Ltd.",
        text: "Hi, has this shipment been weighed by an independent facility?",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "msg-2",
        orderId: "ord-1",
        senderId: "user-contributor-1",
        senderName: "Eco Collector Co.",
        text: "Yes, we have calibrated digital floor scales and we include the weigh-ticket in the delivery folder! It is packed in 3 super-sacks.",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Seed innovations
    this.data.innovations = [
      {
        id: "inn-1",
        title: "DIY Filament Extruder for 3D Printers",
        description: "Transform waste PET bottle flakes into commercial-grade 1.75mm PLA/PET filament using an auger drill, band heaters, and a nozzle setup.",
        materialsUsed: ["PET Bottles", "Steel Pipe", "PID Temperature Controller", "Nozzle 1.75mm"],
        steps: [
          "Shred empty clean PET bottles into fine 3-5mm flakes.",
          "Assemble the heater barrel with a steel nozzle and feed screw (auger drill).",
          "Calibrate the PID heating controller to exactly 245°C.",
          "Pour flakes into the hopper and run the low-RPM gear motor.",
          "Pull the extruded filament through a water cooling bath and wind onto spools."
        ],
        authorName: "Dr. Alice Green",
        authorId: "user-contributor-1",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "inn-2",
        title: "Recycled HDPE Eco-Pavers",
        description: "High-density polyethylene melted at low-toxicity thresholds into compress-molded floor tiles. Perfect for garden paths, walkways, and patio tiles.",
        materialsUsed: ["HDPE Bottle Caps", "Silicone/Steel Molds", "Toaster Oven / Press", "Release Agent"],
        steps: [
          "Gather colorful HDPE caps, wash and sort by color blocks for aesthetic mosaic patterning.",
          "Preheat compression oven to 180°C (below smoke point to prevent emissions).",
          "Pack mold tightly with caps, heat for 25 minutes.",
          "Apply hydraulic jack pressure of 2 tons to compress mold completely.",
          "Cool for 15 minutes before demolding the hyper-durable paver tile."
        ],
        authorName: "Sam Maker",
        authorId: "user-contributor-1",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Seed certificates
    this.data.certificates = [
      {
        id: "cert-1",
        code: "RP-2026-PET-0091",
        companyName: "Eco Collector Co.",
        plasticType: "PET (Type 1)",
        quantityVerified: 15400,
        issueDate: "2026-01-10",
        expiryDate: "2027-01-10",
        status: "Verified",
      },
      {
        id: "cert-2",
        code: "RP-2026-HDPE-1102",
        companyName: "Green Polymers Ltd.",
        plasticType: "HDPE (Type 2)",
        quantityVerified: 45000,
        issueDate: "2026-03-05",
        expiryDate: "2027-03-05",
        status: "Active",
      },
    ];

    this.data.notifications = [
      {
        id: "not-1",
        userId: "user-contributor-1",
        title: "New Purchase Offer",
        message: "Green Polymers Ltd. submitted a purchase offer for your Sorted Clean PET Bottles.",
        type: "request",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  // User Operations
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: Omit<User, "id" | "createdAt">): User {
    const newUser: User = {
      ...user,
      id: "user-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // Listing Operations
  getListings(): Listing[] {
    return this.data.listings;
  }

  getListingById(id: string): Listing | undefined {
    return this.data.listings.find((l) => l.id === id);
  }

  createListing(listing: Omit<Listing, "id" | "createdAt" | "status">): Listing {
    const newListing: Listing = {
      ...listing,
      id: "list-" + Math.random().toString(36).substring(2, 9),
      status: "Available",
      createdAt: new Date().toISOString(),
    };
    this.data.listings.push(newListing);
    this.save();
    return newListing;
  }

  updateListing(id: string, updates: Partial<Listing>): Listing | undefined {
    const idx = this.data.listings.findIndex((l) => l.id === id);
    if (idx === -1) return undefined;
    this.data.listings[idx] = { ...this.data.listings[idx], ...updates };
    this.save();
    return this.data.listings[idx];
  }

  deleteListing(id: string): boolean {
    const lengthBefore = this.data.listings.length;
    this.data.listings = this.data.listings.filter((l) => l.id !== id);
    this.save();
    return this.data.listings.length < lengthBefore;
  }

  // Request Operations
  getRequests(): Request[] {
    return this.data.requests;
  }

  getRequestById(id: string): Request | undefined {
    return this.data.requests.find((r) => r.id === id);
  }

  createRequest(req: Omit<Request, "id" | "createdAt" | "status">): Request {
    const newRequest: Request = {
      ...req,
      id: "req-" + Math.random().toString(36).substring(2, 9),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    this.data.requests.push(newRequest);
    this.save();
    return newRequest;
  }

  updateRequestStatus(id: string, status: "Accepted" | "Declined"): Request | undefined {
    const idx = this.data.requests.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.data.requests[idx].status = status;
    this.save();
    return this.data.requests[idx];
  }

  // Order Operations
  getOrders(): Order[] {
    return this.data.orders;
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id);
  }

  createOrder(order: Omit<Order, "id" | "createdAt" | "status" | "trackingHistory">): Order {
    const newOrder: Order = {
      ...order,
      id: "ord-" + Math.random().toString(36).substring(2, 9),
      status: "Pending",
      trackingHistory: [
        { status: "Pending", timestamp: new Date().toISOString(), note: "Order initialized via request acceptance" }
      ],
      createdAt: new Date().toISOString(),
    };
    this.data.orders.push(newOrder);
    this.save();
    return newOrder;
  }

  updateOrderStatus(id: string, status: Order["status"], note: string): Order | undefined {
    const idx = this.data.orders.findIndex((o) => o.id === id);
    if (idx === -1) return undefined;
    this.data.orders[idx].status = status;
    this.data.orders[idx].trackingHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note,
    });
    this.save();
    return this.data.orders[idx];
  }

  // Message Operations
  getMessagesByOrder(orderId: string): Message[] {
    return this.data.messages.filter((m) => m.orderId === orderId);
  }

  createMessage(msg: Omit<Message, "id" | "timestamp">): Message {
    const newMessage: Message = {
      ...msg,
      id: "msg-" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };
    this.data.messages.push(newMessage);
    this.save();
    return newMessage;
  }

  // Notification Operations
  getNotificationsByUser(userId: string): Notification[] {
    return this.data.notifications.filter((n) => n.userId === userId);
  }

  createNotification(not: Omit<Notification, "id" | "isRead" | "createdAt">): Notification {
    const newNotification: Notification = {
      ...not,
      id: "not-" + Math.random().toString(36).substring(2, 9),
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.push(newNotification);
    this.save();
    return newNotification;
  }

  markNotificationsAsRead(userId: string) {
    this.data.notifications.forEach((n) => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
    this.save();
  }

  markNotificationAsRead(id: string) {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.save();
    }
  }

  deleteNotification(id: string) {
    this.data.notifications = this.data.notifications.filter((n) => n.id !== id);
    this.save();
  }

  // Innovation Operations
  getInnovations(): Innovation[] {
    return this.data.innovations;
  }

  createInnovation(inn: Omit<Innovation, "id" | "createdAt">): Innovation {
    const newInnovation: Innovation = {
      ...inn,
      id: "inn-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    this.data.innovations.push(newInnovation);
    this.save();
    return newInnovation;
  }

  deleteInnovation(id: string, userId: string): boolean {
    const idx = this.data.innovations.findIndex((i) => i.id === id && i.authorId === userId);
    if (idx === -1) return false;
    this.data.innovations.splice(idx, 1);
    this.save();
    return true;
  }

  // Certificate Operations
  getCertificates(): Certificate[] {
    return this.data.certificates;
  }

  verifyCertificate(code: string): Certificate | undefined {
    return this.data.certificates.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());
  }

  createCertificate(cert: Omit<Certificate, "id">): Certificate {
    const newCertificate: Certificate = {
      ...cert,
      id: "cert-" + Math.random().toString(36).substring(2, 9),
    };
    this.data.certificates.push(newCertificate);
    this.save();
    return newCertificate;
  }
}

export const db = new LocalDB();
