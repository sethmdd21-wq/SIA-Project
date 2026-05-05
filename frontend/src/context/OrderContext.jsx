import { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

const API_URL = 'http://localhost:5000/api';

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [ordersRes, ridersRes] = await Promise.all([
        fetch(`${API_URL}/orders`),
        fetch(`${API_URL}/riders`)
      ]);
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (ridersRes.ok) setRiders(await ridersRes.json());
    } catch (err) {
      console.error('Failed to fetch orders/riders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const placeOrder = async (orderData) => {
    const newOrder = {
      ...orderData,
      id: `ORD-${Date.now()}`
    };
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (response.ok) fetchData();
      return newOrder;
    } catch (err) {
      console.error('Failed to place order:', err);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, riderId = null) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, riderId })
      });
      
      if (response.ok) {
        if (riderId) {
          await fetch(`${API_URL}/riders/${riderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus === 'Delivered' ? 'Available' : 'Busy' })
          });
        }
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const addRider = async (rider) => {
    try {
      const response = await fetch(`${API_URL}/riders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rider)
      });
      if (response.ok) fetchData();
    } catch (err) {
      console.error('Failed to add rider:', err);
    }
  };

  const toggleRiderStatus = async (id) => {
    const rider = riders.find(r => r.id === id);
    if (!rider) return;
    try {
      await fetch(`${API_URL}/riders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: rider.status === 'Available' ? 'Busy' : 'Available' })
      });
      fetchData();
    } catch (err) {
      console.error('Failed to toggle rider status:', err);
    }
  };

  const [lastSeenOrdersCount, setLastSeenOrdersCount] = useState(0);

  useEffect(() => {
    setLastSeenOrdersCount(orders.filter(o => o.status === 'Pending').length);
  }, [orders]);

  const clearNotifications = () => {
    setLastSeenOrdersCount(orders.filter(o => o.status === 'Pending').length);
  };

  return (
    <OrderContext.Provider value={{ 
      orders, 
      riders, 
      loading,
      placeOrder, 
      updateOrderStatus, 
      addRider, 
      toggleRiderStatus,
      lastSeenOrdersCount,
      clearNotifications
    }}>
      {children}
    </OrderContext.Provider>
  );
};
