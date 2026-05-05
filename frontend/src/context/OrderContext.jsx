import { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('sia_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [riders, setRiders] = useState(() => {
    const saved = localStorage.getItem('sia_riders');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Juan Dela Cruz', phone: '0917-123-4567', status: 'Available', vehicle: 'Motorcycle' },
      { id: 2, name: 'Maria Santos', phone: '0918-987-6543', status: 'Available', vehicle: 'Bicycle' },
      { id: 3, name: 'Jose Rizal', phone: '0919-555-4444', status: 'Busy', vehicle: 'Motorcycle' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('sia_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sia_riders', JSON.stringify(riders));
  }, [riders]);

  const placeOrder = (orderData) => {
    const newOrder = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      history: [{ status: 'Pending', time: new Date().toISOString() }]
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus, riderId = null) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedOrder = { 
          ...order, 
          status: newStatus,
          history: [...order.history, { status: newStatus, time: new Date().toISOString() }]
        };
        if (riderId) updatedOrder.riderId = riderId;
        return updatedOrder;
      }
      return order;
    }));

    if (riderId) {
      setRiders(prev => prev.map(r => 
        r.id === riderId ? { ...r, status: newStatus === 'Delivered' ? 'Available' : 'Busy' } : r
      ));
    }
  };

  const addRider = (rider) => {
    setRiders(prev => [...prev, { ...rider, id: Date.now(), status: 'Available' }]);
  };

  const deleteRider = (id) => {
    setRiders(prev => prev.filter(r => r.id !== id));
  };

  const deleteOrder = (id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const toggleRiderStatus = (id) => {
    setRiders(prev => prev.map(r => 
      r.id === id ? { ...r, status: r.status === 'Available' ? 'Busy' : 'Available' } : r
    ));
  };

  const [lastSeenOrdersCount, setLastSeenOrdersCount] = useState(orders.filter(o => o.status === 'Pending').length);

  const clearNotifications = () => {
    setLastSeenOrdersCount(orders.filter(o => o.status === 'Pending').length);
  };

  return (
    <OrderContext.Provider value={{ 
      orders, 
      riders, 
      placeOrder, 
      updateOrderStatus, 
      addRider, 
      deleteRider,
      deleteOrder,
      toggleRiderStatus,
      lastSeenOrdersCount,
      clearNotifications
    }}>
      {children}
    </OrderContext.Provider>
  );
};
