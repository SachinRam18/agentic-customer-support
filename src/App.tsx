import React, { useState, useMemo } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeView from "./components/HomeView";
import FeaturesView from "./components/FeaturesView";
import PricingView from "./components/PricingView";
import FAQView from "./components/FAQView";
import PoliciesView from "./components/PoliciesView";
import ContactView from "./components/ContactView";
import DashboardView from "./components/DashboardView";
import LoginView from "./components/LoginView";
import ClientDashboardView from "./components/ClientDashboardView";
import SaaSChatView from "./components/SaaSChatView";

import { 
  initialCustomers, 
  initialOrders, 
  initialInvoices, 
  initialTickets 
} from "./data";
import { Customer, Order, Invoice, Ticket, SubscriptionPlan, SubscriptionStatus } from "./types";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("home");
  
  // Authenticated State Parameters
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<"customer" | "admin" | "guest">("guest");
  const [activeUserId, setActiveUserId] = useState<string>("");
  const [selectedSubTab, setSelectedSubTab] = useState<string>("overview");
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Automatically open floating chat and redirect dashboard view
  React.useEffect(() => {
    if (selectedSubTab === "chat") {
      setSelectedSubTab("overview");
      setIsChatOpen(true);
    }
  }, [selectedSubTab]);


  // Centralized mutable state vectors (simulate synchronized database)
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);

  // Retrieve active Customer instance when logged in
  const activeCustomer = useMemo(() => {
    if (!isLoggedIn || userRole !== "customer") return null;
    return customers.find(c => c.id === activeUserId) || null;
  }, [isLoggedIn, userRole, activeUserId, customers]);

  // Auth Callbacks
  const handleLogin = (id: string, role: "customer" | "admin") => {
    setIsLoggedIn(true);
    setUserRole(role);
    setActiveUserId(id);
    if (role === "admin") {
      setCurrentTab("admin");
    } else {
      setCurrentTab("dashboard");
      setSelectedSubTab("overview");
    }
  };

  const handleRegister = (newCustomer: Customer) => {
    // Add new customer dynamically into mock database
    setCustomers((prev) => [...prev, newCustomer]);
    
    // Create corresponding order and invoice items for high sandbox integrity
    const orderId = `ORD${Math.floor(1100 + Math.random() * 899)}`;
    const invoiceId = `INV-2026-${Math.floor(1100 + Math.random() * 899)}`;
    const planCost = newCustomer.plan === SubscriptionPlan.STARTER ? 199 : newCustomer.plan === SubscriptionPlan.PROFESSIONAL ? 499 : 999;

    const brandOrder: Order = {
      id: orderId,
      customerId: newCustomer.id,
      customerName: newCustomer.name,
      date: new Date().toISOString().split("T")[0],
      amount: planCost,
      planType: newCustomer.plan,
      status: "Paid"
    };

    const brandInvoice: Invoice = {
      id: invoiceId,
      customerId: newCustomer.id,
      customerName: newCustomer.name,
      orderId: orderId,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 10 days grace
      amount: planCost,
      status: "Paid"
    };

    setOrders((prev) => [brandOrder, ...prev]);
    setInvoices((prev) => [brandInvoice, ...prev]);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("guest");
    setActiveUserId("");
    setCurrentTab("home");
  };

  // Central DB Action handlers
  const handleUpdateCustomerEmail = (id: string, newEmail: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, email: newEmail } : c))
    );
  };

  const handleCancelSubscription = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: SubscriptionStatus.CANCELED } : c
      )
    );
  };

  const handleTriggerRefund = (customerId: string, orderId: string) => {
    // Modify Order Status to Refunded
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "Refunded" as any } : o))
    );
    // Sync Invoice status
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.orderId === orderId ? { ...inv, status: "Unpaid" as any } : inv
      )
    );
  };

  const handleAddTicket = (ticket: Ticket) => {
    setTickets((prev) => [ticket, ...prev]);
  };

  const handleAddTicketMessage = (ticketId: string, text: string, sender: "customer" | "ai-agent" | "human-agent") => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            lastUpdatedDate: new Date().toISOString().replace("T", " ").substring(0, 16),
            messages: [
              ...t.messages,
              {
                sender,
                text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
        }
        return t;
      })
    );
  };


  const handleResetDatabase = () => {
    setCustomers(JSON.parse(JSON.stringify(initialCustomers)));
    setOrders(JSON.parse(JSON.stringify(initialOrders)));
    setInvoices(JSON.parse(JSON.stringify(initialInvoices)));
    setTickets(JSON.parse(JSON.stringify(initialTickets)));
    alert("CRM Local Schema reset to default initialization vectors successfully!");
  };

  // View Routing Engine
  const renderCurrentView = () => {
    switch (currentTab) {
      case "home":
        return <HomeView setCurrentTab={setCurrentTab} />;
      case "features":
        return <FeaturesView setCurrentTab={setCurrentTab} />;
      case "pricing":
        return <PricingView setCurrentTab={setCurrentTab} />;
      case "faq":
        return <FAQView />;
      case "policies":
        return <PoliciesView />;
      case "contact":
        return <ContactView />;
      case "login":
        return (
          <LoginView
            customers={customers}
            onLogin={handleLogin}
            onRegister={handleRegister}
            setCurrentTab={setCurrentTab}
          />
        );
      case "admin":
        if (isLoggedIn && userRole === "admin") {
          return (
            <DashboardView
              customers={customers}
              orders={orders}
              invoices={invoices}
              tickets={tickets}
              onUpdateCustomerEmail={handleUpdateCustomerEmail}
              onCancelSubscription={handleCancelSubscription}
              onTriggerRefund={handleTriggerRefund}
              onResetDatabase={handleResetDatabase}
              onAddTicketMessage={handleAddTicketMessage}
            />
          );
        } else {
          return (
            <LoginView
              customers={customers}
              onLogin={handleLogin}
              onRegister={handleRegister}
              setCurrentTab={setCurrentTab}
            />
          );
        }
      case "dashboard":
        if (isLoggedIn && userRole === "customer" && activeCustomer) {
          

          return (
            <ClientDashboardView
              activeCustomer={activeCustomer}
              customers={customers}
              orders={orders}
              invoices={invoices}
              tickets={tickets}
              onUpdateCustomerEmail={handleUpdateCustomerEmail}
              onCancelSubscription={handleCancelSubscription}
              onTriggerRefund={handleTriggerRefund}
              onAddTicket={handleAddTicket}
              onLogout={handleLogout}
              setSelectedSubTab={setSelectedSubTab}
              selectedSubTab={selectedSubTab}
              onOpenChat={() => setIsChatOpen(true)}
            />
          );
        } else if (isLoggedIn && userRole === "admin") {
          return (
            <DashboardView
              customers={customers}
              orders={orders}
              invoices={invoices}
              tickets={tickets}
              onUpdateCustomerEmail={handleUpdateCustomerEmail}
              onCancelSubscription={handleCancelSubscription}
              onTriggerRefund={handleTriggerRefund}
              onResetDatabase={handleResetDatabase}
              onAddTicketMessage={handleAddTicketMessage}
            />
          );
        } else {
          return (
            <LoginView
              customers={customers}
              onLogin={handleLogin}
              onRegister={handleRegister}
              setCurrentTab={setCurrentTab}
            />
          );
        }
      default:
        return <HomeView setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Dynamic Header */}
      <Header 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        currentUser={activeCustomer}
        onLogout={handleLogout}
        setSelectedSubTab={setSelectedSubTab}
        selectedSubTab={selectedSubTab}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Canvas */}
      <main className="flex-1">{renderCurrentView()}</main>

      {/* Footer */}
      <Footer setCurrentTab={setCurrentTab} />

      {/* Persistent Floating Chatbot Overlay */}
      <SaaSChatView
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        activeCustomer={activeCustomer}
        orders={orders}
        invoices={invoices}
        tickets={tickets}
        onUpdateCustomerEmail={handleUpdateCustomerEmail}
        onCancelSubscription={handleCancelSubscription}
        onTriggerRefund={handleTriggerRefund}
        onAddTicket={handleAddTicket}
      />
    </div>
  );
}
