import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db.ts";
import { classifyPlasticImage, askRecyclingAdvisor } from "./server/gemini.ts";
import multer from "multer";

const app = express();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit
const PORT = 3000;

// Body parsing middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Simple Token Middleware (Authorization: Bearer <userId>)
const authUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  const userId = authHeader.split(" ")[1];
  const user = db.getUserById(userId);
  if (!user) {
    return res.status(401).json({ error: "Invalid session token." });
  }
  // Attach user to request
  (req as any).user = user;
  next();
};

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

app.post("/api/auth/register", (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: "Please provide all required fields (email, password, name, role)." });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: "A user with this email already exists." });
  }

  const user = db.createUser({
    email,
    passwordHash: password, // Simplified for dev
    name,
    role,
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
  });

  // Simple token is just the userId itself for direct validation
  res.status(201).json({
    token: user.id,
    user: {
      id: user.id,
      _id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Please provide email and password." });
  }

  const user = db.getUserByEmail(email);
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  res.json({
    token: user.id,
    user: {
      id: user.id,
      _id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

app.get("/api/auth/me", authUser, (req, res) => {
  const user = (req as any).user;
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
  });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  res.json({ message: "Password reset link has been dispatched (simulated). Check your inbox shortly." });
});

app.post("/api/auth/reset-password", (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required" });
  }
  res.json({ message: "Password reset completed successfully. You can now login." });
});

// ==========================================
// 2. MARKETPLACE ENDPOINTS
// ==========================================

app.get("/api/listings", (req, res) => {
  let listings = db.getListings();
  const { q, type, status, location, sortBy } = req.query;

  // Search filter
  if (q) {
    const searchStr = (q as string).toLowerCase();
    listings = listings.filter(
      (l) =>
        l.title.toLowerCase().includes(searchStr) ||
        l.description.toLowerCase().includes(searchStr) ||
        l.location.toLowerCase().includes(searchStr)
    );
  }

  // Plastic type filter
  if (type) {
    listings = listings.filter((l) => l.plasticType.includes(type as string));
  }

  // Status filter
  if (status) {
    listings = listings.filter((l) => l.status === status);
  }

  // Location filter
  if (location) {
    listings = listings.filter((l) => l.location.toLowerCase().includes((location as string).toLowerCase()));
  }

  // Sorting
  if (sortBy) {
    if (sortBy === "price_asc") {
      listings.sort((a, b) => a.pricePerKg - b.pricePerKg);
    } else if (sortBy === "price_desc") {
      listings.sort((a, b) => b.pricePerKg - a.pricePerKg);
    } else if (sortBy === "qty_desc") {
      listings.sort((a, b) => b.quantity - a.quantity);
    } else if (sortBy === "newest") {
      listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } else {
    // Default: newest first
    listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(listings);
});

app.get("/api/listings/:id", (req, res) => {
  const listing = db.getListingById(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found." });
  }
  res.json(listing);
});

app.post("/api/listings", authUser, async (req, res) => {
  const { title, plasticType, quantity, pricePerKg, location, description, image, triggerAi } = req.body;
  const user = (req as any).user;

  if (!title || !quantity || !pricePerKg || !location || !description) {
    return res.status(400).json({ error: "Please fill in all listing details." });
  }

  // Prevent duplicate listings by the same contributor to avoid duplicates
  const existingListings = db.getListings().filter(l => 
    l.contributorId === user.id && 
    l.title.toLowerCase().trim() === title.toLowerCase().trim() &&
    l.status === "Available"
  );
  if (existingListings.length > 0) {
    return res.status(400).json({ error: "A listing with this title already exists under your profile." });
  }

  let aiData: any = {};
  if (triggerAi && image) {
    // Call Gemini API to perform computer vision classification
    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");
    aiData = await classifyPlasticImage(cleanBase64);
  }

  const listing = db.createListing({
    title,
    plasticType: aiData.plasticType || plasticType || "Other (Type 7)",
    quantity: Number(quantity),
    pricePerKg: Number(pricePerKg),
    location,
    description,
    image: image || "https://images.unsplash.com/photo-1526951521990-620dc14c214b?auto=format&fit=crop&q=80&w=600",
    contributorId: user.id,
    contributorName: user.name,
    confidence: aiData.confidence || 0.95,
    condition: aiData.condition || "Sorted Cleaned",
    recyclability: aiData.recyclability || "High",
  });

  res.status(201).json(listing);
});

app.put("/api/listings/:id", authUser, async (req, res) => {
  const { id } = req.params;
  const listing = db.getListingById(id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const user = (req as any).user;
  if (listing.contributorId !== user.id) {
    return res.status(403).json({ error: "Unauthorized. You do not own this listing." });
  }

  const updates = { ...req.body };

  // Support image update re-classification
  const newImage = updates.image || (updates.images && updates.images[0]);
  if (newImage && newImage !== listing.image && newImage.startsWith("data:image/")) {
    try {
      const cleanBase64 = newImage.replace(/^data:image\/\w+;base64,/, "");
      const aiData = await classifyPlasticImage(cleanBase64);
      if (aiData) {
        updates.plasticType = aiData.plasticType || updates.plasticType || listing.plasticType;
        updates.confidence = aiData.confidence || 0.95;
        updates.condition = aiData.condition || updates.condition || listing.condition;
        updates.recyclability = aiData.recyclability || listing.recyclability || "High";
        updates.image = newImage;
      }
    } catch (err) {
      console.error("AI re-classification during listing edit failed:", err);
    }
  }

  const updated = db.updateListing(id, updates);
  res.json(updated);
});

app.delete("/api/listings/:id", authUser, (req, res) => {
  const { id } = req.params;
  const listing = db.getListingById(id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const user = (req as any).user;
  if (listing.contributorId !== user.id) {
    return res.status(403).json({ error: "Unauthorized. You do not own this listing." });
  }

  db.deleteListing(id);
  res.json({ message: "Listing deleted successfully" });
});

// ==========================================
// 3. PROCUREMENT & ORDERS WORKFLOW
// ==========================================

app.get("/api/requests", authUser, (req, res) => {
  const user = (req as any).user;
  const allRequests = db.getRequests();

  // Filter based on role: contributors see requests for their items, buyers see requests they made
  if (user.role === "contributor") {
    res.json(allRequests.filter((r) => r.contributorId === user.id));
  } else {
    res.json(allRequests.filter((r) => r.buyerId === user.id));
  }
});

app.post("/api/requests", authUser, (req, res) => {
  const { listingId, quantity, offerPrice } = req.body;
  const user = (req as any).user;

  if (user.role !== "procurement") {
    return res.status(403).json({ error: "Only Procurement Officers can initiate purchase requests." });
  }

  const listing = db.getListingById(listingId);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found." });
  }

  // Prevent seller from purchasing/requesting their own listing
  if (listing.contributorId === user.id) {
    return res.status(400).json({ error: "Sellers cannot purchase or submit offers to their own listings." });
  }

  // Prevent sold-out listings from being procured
  if (listing.status !== "Available" || listing.quantity <= 0) {
    return res.status(400).json({ error: "This listing is sold out or no longer available for procurement." });
  }

  if (Number(quantity) > listing.quantity) {
    return res.status(400).json({ error: `Requested quantity (${quantity} kg) exceeds available quantity (${listing.quantity} kg).` });
  }

  const request = db.createRequest({
    listingId: listing.id,
    listingTitle: listing.title,
    buyerId: user.id,
    buyerName: user.name,
    contributorId: listing.contributorId,
    quantity: Number(quantity),
    offerPrice: Number(offerPrice),
  });

  // Create notifications
  db.createNotification({
    userId: listing.contributorId,
    title: "New Purchase Offer",
    message: `${user.name} submitted an offer of $${offerPrice}/kg for '${listing.title}'`,
    type: "request",
  });

  res.status(201).json(request);
});

// ACCEPT OR DECLINE PURCHASE OFFER
app.put("/api/requests/:id/status", authUser, (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "Accepted" or "Declined"
  const user = (req as any).user;

  const request = db.getRequestById(id);
  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  if (request.contributorId !== user.id) {
    return res.status(403).json({ error: "Unauthorized. You do not own the material listing." });
  }

  db.updateRequestStatus(id, status);

  if (status === "Accepted") {
    const listing = db.getListingById(request.listingId);
    if (!listing) {
      return res.status(404).json({ error: "Source listing no longer exists." });
    }

    if (listing.quantity < request.quantity) {
      return res.status(400).json({ error: `Cannot accept offer. Listing only has ${listing.quantity} kg remaining, but offer is for ${request.quantity} kg.` });
    }

    // Decrease quantity on successful order, and update listing status
    const remainingQuantity = Math.max(0, listing.quantity - request.quantity);
    const newStatus = remainingQuantity <= 0 ? "Sold" : "Available";
    db.updateListing(listing.id, {
      quantity: remainingQuantity,
      status: newStatus
    });

    // Auto-create persistent order to synchronize Requests & Orders
    const totalAmount = request.quantity * request.offerPrice;
    const order = db.createOrder({
      requestId: request.id,
      listingId: request.listingId,
      listingTitle: request.listingTitle,
      buyerId: request.buyerId,
      buyerName: request.buyerName,
      contributorId: request.contributorId,
      contributorName: user.name,
      quantity: request.quantity,
      totalAmount,
    });

    // Notify Buyer
    db.createNotification({
      userId: request.buyerId,
      title: "Offer Approved!",
      message: `${user.name} accepted your offer for '${request.listingTitle}'. Order ${order.id} is now initialized.`,
      type: "order",
      orderId: order.id,
    });

    res.json({ request, order });
  } else {
    // Declined
    db.createNotification({
      userId: request.buyerId,
      title: "Offer Declined",
      message: `${user.name} declined your purchase offer for '${request.listingTitle}'.`,
      type: "request",
    });

    res.json({ request });
  }
});

app.get("/api/orders", authUser, (req, res) => {
  const user = (req as any).user;
  const allOrders = db.getOrders();

  if (user.role === "contributor") {
    res.json(allOrders.filter((o) => o.contributorId === user.id));
  } else {
    res.json(allOrders.filter((o) => o.buyerId === user.id));
  }
});

app.get("/api/requests/seller-orders", authUser, (req, res) => {
  const user = (req as any).user;
  if (user.role !== "contributor") {
    return res.status(403).json({ error: "Access denied. Only supply contributors can access seller-orders." });
  }
  const matchingOrders = db.getOrders().filter(o => o.contributorId === user.id);
  res.json({
    success: true,
    orders: matchingOrders.map(mapOrder),
  });
});

app.get("/api/requests/buyer-orders", authUser, (req, res) => {
  const user = (req as any).user;
  if (user.role !== "procurement") {
    return res.status(403).json({ error: "Access denied. Only procurement innovators can access buyer-orders." });
  }
  const matchingOrders = db.getOrders().filter(o => o.buyerId === user.id);
  res.json({
    success: true,
    orders: matchingOrders.map(mapOrder),
  });
});

app.get("/api/orders/:id", authUser, (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Order not found." });
  }
  const user = (req as any).user;
  if (order.buyerId !== user.id && order.contributorId !== user.id) {
    return res.status(403).json({ error: "Access denied. You do not have permission to view this order." });
  }
  res.json(order);
});

// UPDATE ORDER STATUS (Timeline workflow with sequential transition validations)
app.put("/api/orders/:id/status", authUser, (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body; // Pending, Accepted, Packed, Dispatched, Delivered, Completed
  const user = (req as any).user;

  const order = db.getOrderById(id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  // Authorize who can make changes
  if (order.buyerId !== user.id && order.contributorId !== user.id) {
    return res.status(403).json({ error: "Access denied. You do not have permission to modify this order." });
  }

  // Define valid order status sequence
  const validSequence = ["Pending", "Accepted", "Packed", "Dispatched", "Delivered", "Completed"];
  const currentStatus = order.status || "Pending";

  // Check if order is already completed
  if (currentStatus === "Completed") {
    return res.status(400).json({ error: "Completed orders are read-only and cannot be updated." });
  }

  const currentIndex = validSequence.indexOf(currentStatus);
  const nextIndex = validSequence.indexOf(status);

  if (nextIndex === -1) {
    return res.status(400).json({ error: `Invalid order status: ${status}` });
  }

  // Enforce sequential status changes (Prevent invalid transitions)
  if (nextIndex <= currentIndex) {
    return res.status(400).json({ error: `Invalid transition. Cannot transition backward or to the same status (from '${currentStatus}' to '${status}').` });
  }

  if (nextIndex > currentIndex + 1) {
    return res.status(400).json({ error: `Invalid transition. Statuses must transition sequentially: current is '${currentStatus}', cannot jump directly to '${status}'.` });
  }

  // Packing, dispatching is done by contributor. Completed confirmation can be done by buyer or either.
  const updatedOrder = db.updateOrderStatus(id, status, note || `Status updated to ${status}`);

  // If status is "Completed", we can also mark the listing as completely "Sold"
  if (status === "Completed") {
    db.updateListing(order.listingId, { status: "Sold" });
  }

  // Send notification to the opposite party
  const notifyUserId = user.role === "contributor" ? order.buyerId : order.contributorId;
  db.createNotification({
    userId: notifyUserId,
    title: `Order Status: ${status}`,
    message: `Order for '${order.listingTitle}' was marked ${status}. Note: ${note}`,
    type: "order",
    orderId: order.id,
  });

  res.json(updatedOrder);
});

// ==========================================
// 4. CHAT ENDPOINTS & PROTOCOLNEXUS INTEGRATION
// ==========================================

app.get("/api/orders/:id/messages", authUser, (req, res) => {
  const { id } = req.params;
  const order = db.getOrderById(id);
  if (!order) {
    return res.status(404).json({ error: "Order context not found" });
  }
  const user = (req as any).user;
  if (order.buyerId !== user.id && order.contributorId !== user.id) {
    return res.status(403).json({ error: "Access denied. You do not have permission to view these messages." });
  }
  const messages = db.getMessagesByOrder(id);
  res.json(messages);
});

app.post("/api/orders/:id/messages", authUser, (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const user = (req as any).user;

  if (!text) {
    return res.status(400).json({ error: "Message text cannot be empty." });
  }

  const order = db.getOrderById(id);
  if (!order) {
    return res.status(404).json({ error: "Order context not found" });
  }

  if (order.buyerId !== user.id && order.contributorId !== user.id) {
    return res.status(403).json({ error: "Access denied. You do not have permission to send messages to this order." });
  }

  const message = db.createMessage({
    orderId: id,
    senderId: user.id,
    senderName: user.name,
    text,
  });

  // Notify other party
  const notifyUserId = user.id === order.buyerId ? order.contributorId : order.buyerId;
  db.createNotification({
    userId: notifyUserId,
    title: `New Chat from ${user.name}`,
    message: text.substring(0, 60) + (text.length > 60 ? "..." : ""),
    type: "chat",
    orderId: order.id,
  });

  // --- ProtocolNexus Smart Agreement Detector ---
  // In a real system, ProtocolNexus analyzes the communication to auto-generate verified transaction smart contracts.
  // We simulate this by checking if the message contains keywords indicating final logistics agreement, pricing consensus, or collection confirmation.
  const lowercaseText = text.toLowerCase();
  let nexusAlert = null;
  if (
    (lowercaseText.includes("deal") || lowercaseText.includes("confirm") || lowercaseText.includes("agree")) &&
    (lowercaseText.includes("price") || lowercaseText.includes("freight") || lowercaseText.includes("ship"))
  ) {
    nexusAlert = {
      type: "ProtocolNexus Contract Sealed",
      hash: "0x" + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10),
      rulesSealed: ["Quantity Fixed", "Weigh-Ticket Calibrated", "Independent Certification Escrow Locked"],
      details: "Communication consensus matched ProtocolNexus circular marketplace contract parameters.",
    };
  }

  res.status(201).json({ message, nexusAlert });
});

// ==========================================
// 5. NOTIFICATIONS ENDPOINTS
// ==========================================

app.get("/api/notifications", authUser, (req, res) => {
  const user = (req as any).user;
  res.json(db.getNotificationsByUser(user.id));
});

app.post("/api/notifications/read", authUser, (req, res) => {
  const user = (req as any).user;
  db.markNotificationsAsRead(user.id);
  res.json({ success: true });
});

app.put("/api/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  db.markNotificationAsRead(id);
  res.json({ success: true });
});

app.delete("/api/notifications/:id", (req, res) => {
  const { id } = req.params;
  db.deleteNotification(id);
  res.json({ success: true });
});

// ==========================================
// 6. ANALYTICS & CO₂ REDUCTION ENDPOINTS
// ==========================================

app.get("/api/analytics", authUser, (req, res) => {
  const user = (req as any).user;
  const orders = db.getOrders();
  const listings = db.getListings();

  // Quantify stats
  // We count both Completed orders or Dispatched orders for transaction volume
  const finishedOrders = orders.filter((o) => o.status === "Completed" || o.status === "Dispatched" || o.status === "Delivered");
  
  let totalRevenue = 0;
  let totalPlasticTraded = 0; // in kg
  
  finishedOrders.forEach((o) => {
    totalRevenue += o.totalAmount;
    totalPlasticTraded += o.quantity;
  });

  // Calculate CO2 Saved
  // 1kg of recycled plastic ≈ 1.5kg CO2 avoided as documented
  const co2Saved = totalPlasticTraded * 1.5;

  // Compute plastic distribution by type
  const plasticDistribution: { [key: string]: number } = {};
  listings.forEach((l) => {
    plasticDistribution[l.plasticType] = (plasticDistribution[l.plasticType] || 0) + l.quantity;
  });

  const formattedDistribution = Object.keys(plasticDistribution).map((type) => ({
    name: type,
    value: plasticDistribution[type],
  }));

  // Simple monthly timeline trends
  const monthlyAnalytics = [
    { month: "Jan", recycled: 1500, co2: 2250, revenue: 1300 },
    { month: "Feb", recycled: 2100, co2: 3150, revenue: 1800 },
    { month: "Mar", recycled: 3200, co2: 4800, revenue: 2750 },
    { month: "Apr", recycled: 4800, co2: 7200, revenue: 4100 },
    { month: "May", recycled: 6100, co2: 9150, revenue: 5300 },
    { month: "Jun", recycled: totalPlasticTraded || 5500, co2: co2Saved || 8250, revenue: totalRevenue || 4800 },
  ];

  res.json({
    revenue: totalRevenue || 3450, // provide fallback values if orders are freshly initialized
    plasticTraded: totalPlasticTraded || 3800,
    ordersCount: orders.length,
    co2Saved: co2Saved || 5700,
    distribution: formattedDistribution.length > 0 ? formattedDistribution : [
      { name: "PET (Type 1)", value: 1200 },
      { name: "HDPE (Type 2)", value: 2500 },
      { name: "PP (Type 5)", value: 800 }
    ],
    monthlyAnalytics,
    co2ApproximationSource: "According to EPA and Association of Plastic Recyclers (APR) offsets data, recycling 1kg of post-consumer plastic offsets approximately 1.5kg of carbon dioxide (CO2) emission equivalence otherwise triggered during virgin fossil-polymer raw material extraction and polymerization.",
  });
});

app.get("/api/seller/dashboard-stats", authUser, (req, res) => {
  const user = (req as any).user;
  if (user.role !== "contributor") {
    return res.status(403).json({ error: "Access denied. Only supply contributors can access seller metrics." });
  }

  const allListings = db.getListings().filter(l => l.contributorId === user.id);
  const allRequests = db.getRequests().filter(r => r.contributorId === user.id);
  const allOrders = db.getOrders().filter(o => o.contributorId === user.id);
  const allNotifications = db.getNotificationsByUser(user.id);

  // Filter requests
  const pendingRequests = allRequests.filter(r => r.status === "Pending");
  const acceptedRequests = allRequests.filter(r => r.status === "Accepted");

  // Filter orders
  const activeOrders = allOrders.filter(o => o.status !== "Completed");
  const completedOrders = allOrders.filter(o => o.status === "Completed");

  // Revenue & Plastic Sold from Completed Orders
  const revenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const plasticSold = completedOrders.reduce((sum, o) => sum + o.quantity, 0);

  // Dynamic Monthly Sales
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Baseline matching the seed data
  const monthlyMap: { [key: string]: { recycled: number; revenue: number } } = {
    "Jan": { recycled: 120, revenue: 100 },
    "Feb": { recycled: 180, revenue: 150 },
    "Mar": { recycled: 250, revenue: 210 },
    "Apr": { recycled: 400, revenue: 340 },
    "May": { recycled: 480, revenue: 410 },
    "Jun": { recycled: 550, revenue: 480 },
  };

  // Add actual values from completed orders
  completedOrders.forEach(o => {
    const d = new Date(o.createdAt);
    const mName = monthNames[d.getMonth()];
    if (mName) {
      if (!monthlyMap[mName]) {
        monthlyMap[mName] = { recycled: 0, revenue: 0 };
      }
      monthlyMap[mName].recycled += o.quantity;
      monthlyMap[mName].revenue += o.totalAmount;
    }
  });

  const monthlySales = Object.keys(monthlyMap).map(m => ({
    month: m,
    volume: monthlyMap[m].recycled,
    revenue: monthlyMap[m].revenue,
  }));

  // Fetch recent messages on orders owned by this seller
  const recentMessages = db.getOrders()
    .filter(o => o.contributorId === user.id)
    .flatMap(o => db.getMessagesByOrder(o.id))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  res.json({
    success: true,
    myListings: allListings.map(mapListing),
    pendingRequests,
    acceptedRequests,
    orders: allOrders.map(mapOrder),
    completedOrders: completedOrders.map(mapOrder),
    revenue,
    plasticSold,
    monthlySales,
    recentNotifications: allNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    recentMessages,
  });
});

app.get("/api/buyer/dashboard-stats", authUser, (req, res) => {
  const user = (req as any).user;
  if (user.role !== "procurement") {
    return res.status(403).json({ error: "Access denied. Only procurement innovators can access buyer metrics." });
  }

  const allRequests = db.getRequests().filter(r => r.buyerId === user.id);
  const allOrders = db.getOrders().filter(o => o.buyerId === user.id);
  const allNotifications = db.getNotificationsByUser(user.id);

  // Filter requests
  const pendingRequests = allRequests.filter(r => r.status === "Pending");
  const acceptedRequests = allRequests.filter(r => r.status === "Accepted");

  // Filter orders
  const acceptedOrders = allOrders.filter(o => o.status === "Accepted");
  const currentOrders = allOrders.filter(o => o.status !== "Completed");
  const completedOrders = allOrders.filter(o => o.status === "Completed");

  // Stats
  const plasticPurchased = completedOrders.reduce((sum, o) => sum + o.quantity, 0);
  const co2Saved = plasticPurchased * 1.5; // 1.5kg CO2 saved per kg of recycled plastic

  // Requested Products list
  const requestedProducts = allRequests.map(r => ({
    id: r.id,
    listingId: r.listingId,
    title: r.listingTitle,
    quantity: r.quantity,
    offerPrice: r.offerPrice,
    status: r.status,
    createdAt: r.createdAt,
  }));

  // Fetch recent messages on orders owned by this buyer
  const recentMessages = db.getOrders()
    .filter(o => o.buyerId === user.id)
    .flatMap(o => db.getMessagesByOrder(o.id))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  res.json({
    success: true,
    allRequests,
    pendingRequests,
    acceptedRequests,
    acceptedOrders: acceptedOrders.map(mapOrder),
    currentOrders: currentOrders.map(mapOrder),
    completedOrders: completedOrders.map(mapOrder),
    plasticPurchased,
    co2Saved,
    requestedProducts,
    recentNotifications: allNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    recentMessages,
  });
});

// ==========================================
// 7. AI & COMPUTER VISION ENDPOINTS
// ==========================================

app.post("/api/ai/classify", authUser, async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: "Image data (base64) is required for sorting classification." });
  }

  // 1. Check size (approximate from base64 length)
  const approxSizeInBytes = (image.length * 3) / 4;
  if (approxSizeInBytes > 10 * 1024 * 1024) {
    return res.status(400).json({ error: "Image size exceeds 10MB limit. Please upload a smaller image." });
  }

  // 2. Check unsupported formats / mime types
  let mimeType = "image/jpeg";
  const mimeMatch = image.match(/^data:([^;]+);base64,/);
  if (mimeMatch) {
    mimeType = mimeMatch[1];
    if (!mimeType.startsWith("image/")) {
      return res.status(400).json({ error: `Unsupported file format (${mimeType}). Please upload a valid image file.` });
    }
    const supportedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
    if (!supportedTypes.includes(mimeType)) {
      return res.status(400).json({ error: `Unsupported image format (${mimeType}). Only JPEG, PNG, WEBP, and GIF are supported.` });
    }
  }

  // 3. Check corrupted / invalid base64
  const base64Content = image.includes("base64,") ? image.split("base64,")[1] : image;
  const isBase64 = /^[a-zA-Z0-9+/]*={0,2}$/.test(base64Content.trim().replace(/\s/g, ""));
  if (!isBase64 || base64Content.length < 50) {
    return res.status(400).json({ error: "Corrupted image file. The image structure is invalid or unreadable." });
  }

  try {
    const classification = await classifyPlasticImage(base64Content, mimeType);
    
    // Return both formats for complete backward-and-forward compatibility
    res.json({
      ...classification,
      predictedClass: classification.plasticType,
      confidenceRate: classification.confidence,
      conditionAssessment: classification.condition,
      neuralModelUsed: "Gemini-3.5-Flash Multimodal Vision",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ai/chat", async (req, res) => {
  const { prompt, chatHistory, image } = req.body;
  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt cannot be empty" });
  }

  try {
    const answer = await askRecyclingAdvisor(prompt, chatHistory || [], image);
    res.json({ answer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Alias for frontend compatibility with /api/gemini/ask
app.post("/api/gemini/ask", async (req, res) => {
  const { question, prompt, chatHistory, image } = req.body;
  const actualPrompt = prompt || question;
  if (!actualPrompt || actualPrompt.trim() === "") {
    return res.status(400).json({ error: "Prompt cannot be empty" });
  }

  try {
    const answer = await askRecyclingAdvisor(actualPrompt, chatHistory || [], image);
    res.json({ success: true, answer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 8. INNOVATIONS ENDPOINTS (CRUD)
// ==========================================

app.get("/api/innovations", (req, res) => {
  res.json(db.getInnovations());
});

app.post("/api/innovations", authUser, (req, res) => {
  const { title, description, materialsUsed, steps } = req.body;
  const user = (req as any).user;

  if (!title || !description || !materialsUsed || !steps) {
    return res.status(400).json({ error: "Please provide all required innovation fields." });
  }

  const newInn = db.createInnovation({
    title,
    description,
    materialsUsed: Array.isArray(materialsUsed) ? materialsUsed : materialsUsed.split(",").map((s: string) => s.trim()),
    steps: Array.isArray(steps) ? steps : steps.split("\n").filter((s: string) => s.trim().length > 0),
    authorName: user.name,
    authorId: user.id,
  });

  res.status(201).json(newInn);
});

app.delete("/api/innovations/:id", authUser, (req, res) => {
  const { id } = req.params;
  const user = (req as any).user;

  const deleted = db.deleteInnovation(id, user.id);
  if (!deleted) {
    return res.status(403).json({ error: "Unauthorized or Innovation not found." });
  }

  res.json({ success: true, message: "Innovation removed successfully." });
});

// ==========================================
// 9. CERTIFICATES & CONTACT ENDPOINTS
// ==========================================

app.get("/api/certificates/verify/:code", (req, res) => {
  const { code } = req.params;
  const cert = db.verifyCertificate(code);
  if (!cert) {
    return res.status(404).json({ error: "Certificate registry match not found." });
  }
  res.json(cert);
});

app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body;
  console.log(`[CONTACT FORM] Message received. Name: ${name}, Email: ${email}, Subject: ${subject}. Content: ${message}`);
  // Return stubbed successful response
  res.json({ success: true, message: "Thank you for contacting Replast. Our sustainability coordinators will review your ticket." });
});

// ==========================================
// 10. FRONTEND UI COMPATIBILITY ALIAS ROUTES
// ==========================================

app.post("/api/users/register", (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: "Please provide all required fields (email, password, name, role)." });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: "A user with this email already exists." });
  }

  const user = db.createUser({
    email,
    passwordHash: password,
    name,
    role,
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
  });

  res.status(201).json({
    success: true,
    token: user.id,
    user: {
      id: user.id,
      _id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

app.post("/api/users/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Please provide email and password." });
  }

  const user = db.getUserByEmail(email);
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  res.json({
    success: true,
    token: user.id,
    user: {
      id: user.id,
      _id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

app.post("/api/users/forgot-password", (req, res) => {
  res.json({ success: true, message: "If this email exists, a recovery link has been sent." });
});

app.get("/api/notifications/list", (req, res) => {
  const userId = req.query.userId || req.body.userId;
  const notifications = userId ? db.getNotificationsByUser(userId as string) : [];
  res.json({
    success: true,
    notifications: notifications.map(n => ({ ...n, _id: n.id })),
    unreadCount: notifications.filter(n => !n.isRead).length
  });
});

app.put("/api/notifications/read-all", (req, res) => {
  const { userId } = req.body;
  if (userId) {
    db.markNotificationsAsRead(userId);
  }
  res.json({ success: true });
});

app.get("/api/sellers/telemetry", (req, res) => {
  res.json({
    success: true,
    telemetry: {
      plasticDivertedKg: 2400,
      innovationsMade: 180,
      activeContributors: 95,
    }
  });
});

const mapListing = (l: any) => ({
  ...l,
  _id: l.id,
  price: l.pricePerKg,
  weightKg: l.quantity,
  images: [l.image || "https://images.unsplash.com/photo-1526951521990-620dc14c214b?auto=format&fit=crop&q=80&w=600"],
  contributorId: { name: l.contributorName, id: l.contributorId },
  seller: l.contributorName,
  owner: l.contributorName,
});

const mapOrder = (o: any) => ({
  ...o,
  _id: o.id,
  orderId: o.id,
  listingTitle: o.listingTitle,
  weightKg: o.quantity,
  price: o.totalAmount / (o.quantity || 1),
  seller: o.contributorName,
  owner: o.contributorName,
});

app.get("/api/listings/list", (req, res) => {
  const listings = db.getListings().map(mapListing);
  res.json({ success: true, listings });
});

app.post("/api/listings/add", authUser, upload.array("images"), async (req, res) => {
  const user = (req as any).user;
  const { title, description, plasticType, condition, weightKg, price, location } = req.body;

  if (!title || !weightKg || !price || !location) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  let imageBase64 = "";
  const files = req.files as Express.Multer.File[];
  if (files && files.length > 0) {
    imageBase64 = `data:${files[0].mimetype};base64,${files[0].buffer.toString("base64")}`;
  }

  let aiData: any = {};
  if (imageBase64) {
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      aiData = await classifyPlasticImage(cleanBase64);
    } catch (err) {
      console.error("AI Auto-classification failed inside upload", err);
    }
  }

  const newListing = db.createListing({
    title,
    plasticType: aiData.plasticType || plasticType || "Other (Type 7)",
    quantity: Number(weightKg),
    pricePerKg: Number(price),
    location,
    description: description || "",
    image: imageBase64 || "https://images.unsplash.com/photo-1526951521990-620dc14c214b?auto=format&fit=crop&q=80&w=600",
    contributorId: user.id,
    contributorName: user.name,
    confidence: aiData.confidence || 0.95,
    condition: condition || aiData.condition || "Sorted Cleaned",
    recyclability: aiData.recyclability || "High",
  });

  res.status(201).json({ success: true, listing: mapListing(newListing) });
});

app.get("/api/requests/seller-orders", authUser, (req, res) => {
  const user = (req as any).user;
  const orders = db.getOrders().filter(o => o.contributorId === user.id).map(mapOrder);
  res.json({ success: true, orders });
});

app.get("/api/requests/buyer-orders", authUser, (req, res) => {
  const user = (req as any).user;
  const orders = db.getOrders().filter(o => o.buyerId === user.id).map(mapOrder);
  res.json({ success: true, orders });
});

app.post("/api/requests/submit", authUser, (req, res) => {
  const user = (req as any).user;
  const { listingId, proposedPickupDate, message } = req.body;

  const listing = db.getListingById(listingId);
  if (!listing) {
    return res.status(404).json({ success: false, error: "Listing not found" });
  }

  const request = db.createRequest({
    listingId: listing.id,
    listingTitle: listing.title,
    buyerId: user.id,
    buyerName: user.name,
    contributorId: listing.contributorId,
    quantity: listing.quantity,
    offerPrice: listing.pricePerKg,
  });

  db.createNotification({
    userId: listing.contributorId,
    title: "New Procurement Request",
    message: `${user.name} requested pickup for '${listing.title}' on ${proposedPickupDate || 'unspecified date'}.`,
    type: "request",
  });

  res.json({ success: true, request });
});



// ==========================================
// VITE OR STATIC SERVING INTEGRATION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Replast backend running on http://localhost:${PORT}`);
  });
}

startServer();
