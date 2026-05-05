import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMenu } from '../context/MenuContext';
import { useOrders } from '../context/OrderContext';
import { PlusCircle, Edit2, Trash2, X, Save, LayoutDashboard, UtensilsCrossed, Search, MessageSquare, Tag, Upload, Reply, ShoppingBag, Truck, CheckCircle, Clock } from 'lucide-react';
import './AdminDashboard.css';

const emptyForm = { name: '', price: '', category: 'Mains', img: '', rating: 4.5 };

const AdminDashboard = () => {
  const { menuItems, categories, addMenuItem, editMenuItem, deleteMenuItem, addCategory, deleteCategory, replyToReview } = useMenu();
  const { orders, riders, updateOrderStatus, addRider, deleteRider, deleteOrder, toggleRiderStatus, lastSeenOrdersCount, clearNotifications } = useOrders();
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'categories', 'reviews', 'orders', 'riders'
  const [showHistory, setShowHistory] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [replyText, setReplyText] = useState({});
  const [riderForm, setRiderForm] = useState({ name: '', phone: '', vehicle: 'Motorcycle', plate: '', model: '' });
  const [showRiderModal, setShowRiderModal] = useState(false);
  
  // Notification States (Reviews still local as they are in MenuContext)
  const [hasSeenUnrepliedReviews, setHasSeenUnrepliedReviews] = useState(() => {
    return localStorage.getItem('hasSeenUnrepliedReviews') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('hasSeenUnrepliedReviews', hasSeenUnrepliedReviews);
  }, [hasSeenUnrepliedReviews]);

  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const unrepliedReviews = menuItems.some(item => item.reviews?.some(r => !r.reply));

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'orders') clearNotifications();
    if (tab === 'reviews') setHasSeenUnrepliedReviews(true);
  };

  const fileInputRef = useRef(null);

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allReviews = (menuItems || []).flatMap(item => 
    (item?.reviews || []).map(review => ({ ...review, dishId: item?.id, dishName: item?.name, dishImg: item?.img }))
  ).sort((a, b) => (Number(b?.id) || 0) - (Number(a?.id) || 0));

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const openAdd = () => {
    setEditingItem(null);
    setForm({ ...emptyForm, category: categories[0] || 'Mains' });
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({ name: item.name, price: item.price, category: item.category, img: item.img, rating: item.rating });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.price.trim()) e.price = 'Price is required.';
    else if (!/^₱\d+(\.\d{1,2})?$/.test(form.price.trim())) e.price = 'Price must be in ₱ format (e.g. ₱250.00)';
    if (!form.img.trim()) e.img = 'Image is required.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e_ = validate();
    if (Object.keys(e_).length > 0) { setErrors(e_); return; }
    if (editingItem) {
      editMenuItem(editingItem.id, form);
    } else {
      addMenuItem(form);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    deleteMenuItem(id);
    setDeleteConfirm(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, img: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleReply = (dishId, reviewId) => {
    const text = replyText[reviewId];
    if (text?.trim()) {
      replyToReview(dishId, reviewId, text.trim());
      setReplyText({ ...replyText, [reviewId]: '' });
    }
  };

  const handleStatusChange = (orderId, status, riderId = null) => {
    updateOrderStatus(orderId, status, riderId);
  };

  const [riderPhoneError, setRiderPhoneError] = useState('');

  const handleAddRider = (e) => {
    e.preventDefault();
    
    const phonePattern = /^09\d{9}$/;
    if (!phonePattern.test(riderForm.phone)) {
      setRiderPhoneError('Please enter a valid 11-digit phone number starting with 09');
      return;
    }
    setRiderPhoneError('');

    addRider(riderForm);
    setRiderForm({ name: '', phone: '', vehicle: 'Motorcycle', plate: '', model: '' });
    setShowRiderModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Preparing': return '#3b82f6';
      case 'Out for Delivery': return '#8b5cf6';
      case 'Delivered': return '#10b981';
      case 'Cancelled': return '#ef4444';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <>
      <div className="admin-page container animate-fade-in">
      <div className="admin-page-header">
        <div className="admin-title-group">
          <LayoutDashboard size={32} className="admin-title-icon" />
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage your Filipino food platform</p>
          </div>
        </div>
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => handleTabClick('menu')}>
            <UtensilsCrossed size={18} /> Menu
          </button>
          <button className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => handleTabClick('orders')}>
            <ShoppingBag size={18} /> Orders
            {pendingOrders.length > lastSeenOrdersCount && (
              <span className="admin-tab-badge">{pendingOrders.length - lastSeenOrdersCount}</span>
            )}
          </button>
          <button className={`admin-tab ${activeTab === 'riders' ? 'active' : ''}`} onClick={() => handleTabClick('riders')}>
            <Truck size={18} /> Riders
          </button>
          <button className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => handleTabClick('categories')}>
            <Tag size={18} /> Categories
          </button>
          <button className={`admin-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => handleTabClick('reviews')}>
            <MessageSquare size={18} /> Reviews
            {unrepliedReviews && !hasSeenUnrepliedReviews && (
              <span className="admin-tab-badge dot"></span>
            )}
          </button>
        </div>
      </div>

      <div className="admin-stats glass-panel">
        <div className="stat-card">
          <span className="stat-value">{menuItems.length}</span>
          <span className="stat-label">Total Dishes</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{orders.filter(o => o.status !== 'Delivered').length}</span>
          <span className="stat-label">Active Orders</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{riders.filter(r => r.status === 'Available').length}</span>
          <span className="stat-label">Available Riders</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{menuItems.length > 0 ? (menuItems.reduce((s, i) => s + Number(i.rating || 0), 0) / menuItems.length).toFixed(1) : '0.0'}</span>
          <span className="stat-label">Avg. Rating</span>
        </div>
      </div>

      {activeTab === 'menu' && (
        <div className="admin-section glass-panel">
          <div className="admin-section-header">
            <h2><UtensilsCrossed size={22} /> Menu Items ({filteredItems.length})</h2>
            <div className="admin-header-actions">
              <div className="admin-search-bar">
                <Search size={16} className="search-icon-inner" />
                <input
                  type="text"
                  placeholder="Search by name or category..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="menu-search-input"
                />
                {searchQuery && <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>}
              </div>
              <button className="btn-primary add-food-btn" onClick={openAdd}>
                <PlusCircle size={18} /> Add Dish
              </button>
            </div>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <img src={item.img} alt={item.name} className="admin-food-thumb" />
                    </td>
                    <td className="food-name-cell">{item.name}</td>
                    <td><span className="category-badge">{item.category}</span></td>
                    <td className="price-cell">{item.price}</td>
                    <td>⭐ {item.rating}</td>
                    <td>
                      <div className="action-btns">
                        <button className="edit-icon-btn" onClick={() => openEdit(item)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="delete-icon-btn" onClick={() => setDeleteConfirm(item.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="admin-section glass-panel">
          <div className="admin-section-header">
            <div className="admin-tab-subgroup">
              <button className={`admin-tab-sm ${!showHistory ? 'active' : ''}`} onClick={() => setShowHistory(false)}>Active Orders</button>
              <button className={`admin-tab-sm ${showHistory ? 'active' : ''}`} onClick={() => setShowHistory(true)}>Order History</button>
            </div>
          </div>
          
          <div className="admin-table-wrapper">
            {!showHistory ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Rider</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').map(order => (
                    <tr key={order.id}>
                      <td className="order-id-cell">{order?.id || 'N/A'}</td>
                      <td>
                        <div className="customer-cell">
                          <strong>{order?.user?.name || 'Unknown User'}</strong>
                          <span>{order?.details?.phone || order?.user?.phone || 'No Phone'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`type-badge ${(order?.type || 'Delivery').toLowerCase()}`}>
                          {order?.type === 'Delivery' ? <Truck size={14} /> : <Clock size={14} />}
                          {order?.type || 'Delivery'}
                        </span>
                      </td>
                      <td className="price-cell">
                        ₱{(Number(order?.total) || 0).toFixed(2)}
                        <div className={`payment-status-badge ${order?.paymentStatus?.toLowerCase() || 'pending'}`}>
                          {order?.paymentMethod === 'GCash' ? (order?.paymentStatus === 'Paid' ? 'PAID' : 'PENDING') : (order?.paymentMethod || 'COD')}
                        </div>
                      </td>
                      <td>
                        <span className="status-indicator" style={{ background: getStatusColor(order?.status || 'Pending') }}>
                          {order?.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        {order.type === 'Delivery' ? (
                          order.riderId ? (
                            <div className="rider-cell">
                              <strong>{riders.find(r => r.id === order.riderId)?.name}</strong>
                            </div>
                          ) : (
                            <select 
                              className="admin-select-sm"
                              onChange={(e) => handleStatusChange(order.id, 'Out for Delivery', parseInt(e.target.value))}
                              defaultValue=""
                            >
                              <option value="" disabled>Assign Rider</option>
                              {riders.filter(r => r.status === 'Available').map(r => (
                                <option key={r.id} value={r.id}>{r.name} ({r.vehicle})</option>
                              ))}
                            </select>
                          )
                        ) : '—'}
                      </td>
                      <td>
                        <div className="status-actions">
                          {order.status === 'Pending' && (
                            <button className="btn-status prepare" onClick={() => handleStatusChange(order.id, 'Preparing')}>Prepare</button>
                          )}
                          {order.status === 'Preparing' && order.type === 'Takeout' && (
                            <button className="btn-status deliver" onClick={() => handleStatusChange(order.id, 'Delivered')}>Ready</button>
                          )}
                          {order.status === 'Out for Delivery' && (
                            <button className="btn-status deliver" onClick={() => handleStatusChange(order.id, 'Delivered')}>Done</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length === 0 && (
                    <tr><td colSpan="7" className="empty-table-cell">No active orders</td></tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled').map(order => (
                    <tr key={order.id}>
                      <td className="order-id-cell">{order?.id || 'N/A'}</td>
                      <td><strong>{order?.user?.name || 'Unknown User'}</strong></td>
                      <td>{order?.type || 'N/A'}</td>
                      <td className="price-cell">₱{(Number(order?.total) || 0).toFixed(2)}</td>
                      <td>
                        <span className="status-indicator" style={{ background: getStatusColor(order?.status || 'Pending') }}>
                          {order?.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <button className="delete-icon-btn" onClick={() => deleteOrder(order.id)} title="Delete from History">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled').length === 0 && (
                    <tr><td colSpan="6" className="empty-table-cell">No order history</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'riders' && (
        <div className="admin-section glass-panel">
          <div className="admin-section-header">
            <h2><Truck size={22} /> Rider Management ({riders.length})</h2>
            <button className="btn-primary" onClick={() => setShowRiderModal(true)}>
              <PlusCircle size={18} /> Add Rider
            </button>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Vehicle Details</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {riders.map(rider => (
                  <tr key={rider.id}>
                    <td><strong>{rider.name}</strong></td>
                    <td>{rider.phone}</td>
                    <td>
                      <div className="vehicle-cell">
                        <strong>{rider.vehicle}</strong>
                        {rider.model && <span>{rider.model} ({rider.plate})</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`rider-status ${rider.status.toLowerCase()}`}>
                        {rider.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button 
                          className={`btn-status-toggle ${rider.status === 'Available' ? 'busy' : 'available'}`}
                          onClick={() => toggleRiderStatus(rider.id)}
                          title={`Set as ${rider.status === 'Available' ? 'Busy' : 'Available'}`}
                        >
                          {rider.status === 'Available' ? <Clock size={14} /> : <CheckCircle size={14} />}
                          {rider.status === 'Available' ? 'Set Busy' : 'Set Avail'}
                        </button>
                        <button className="delete-icon-btn" onClick={() => deleteRider(rider.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="admin-section glass-panel">
          <div className="admin-section-header">
            <h2><Tag size={22} /> Categories ({categories.length})</h2>
            <form onSubmit={handleAddCategory} className="admin-inline-form">
              <input 
                className="input-field" 
                placeholder="New category name..." 
                value={newCategory} 
                onChange={e => setNewCategory(e.target.value)}
              />
              <button type="submit" className="btn-primary"><PlusCircle size={18} /> Add</button>
            </form>
          </div>
          <div className="category-list-grid">
            {categories.map(cat => (
              <div key={cat} className="category-manage-card card">
                <span>{cat}</span>
                <button className="delete-icon-btn" onClick={() => deleteCategory(cat)} title="Delete Category">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="admin-section glass-panel">
          <div className="admin-section-header">
            <h2><MessageSquare size={22} /> Review Management ({allReviews.length})</h2>
          </div>
          <div className="admin-reviews-list">
            {allReviews.map(review => (
              <div key={review.id} className="admin-review-card card">
                <div className="review-header">
                  <div className="review-dish-info">
                    <img src={review.dishImg} alt={review.dishName} className="review-dish-thumb" />
                    <div>
                      <h4>{review.dishName}</h4>
                      <span className="review-meta">by {review.user_name || 'Anonymous'} on {formatDate(review.date)}</span>
                    </div>
                  </div>
                  <div className="review-rating-stars">
                    {'⭐'.repeat(review.rating)}
                  </div>
                </div>
                <p className="review-text">"{review.comment}"</p>
                
                {review.reply ? (
                  <div className="admin-reply-box">
                    <div className="reply-header"><Reply size={14} /> Admin Reply</div>
                    <p>{review.reply}</p>
                  </div>
                ) : (
                  <div className="reply-form">
                    <input 
                      className="input-field" 
                      placeholder="Type a reply..." 
                      value={replyText[review.id] || ''} 
                      onChange={e => setReplyText({...replyText, [review.id]: e.target.value})}
                    />
                    <button className="btn-primary btn-sm" onClick={() => handleReply(review.dishId, review.id)}>
                      <Reply size={14} /> Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
            {allReviews.length === 0 && <p className="empty-state">No reviews to display.</p>}
          </div>
        </div>
      )}

      </div>

      {/* Add / Edit Dish Modal */}
      {showModal && createPortal(
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal glass-panel animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingItem ? 'Edit Dish' : 'Add New Dish'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-group">
                <label>Dish Name</label>
                <input className={`input-field ${errors.name ? 'error-input' : ''}`} placeholder="e.g. Special Adobo" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                {errors.name && <span className="admin-error">{errors.name}</span>}
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Price</label>
                  <input className={`input-field ${errors.price ? 'error-input' : ''}`} placeholder="₱250.00" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                  {errors.price && <span className="admin-error">{errors.price}</span>}
                </div>
                <div className="admin-form-group">
                  <label>Category</label>
                  <select className="input-field admin-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="admin-form-group">
                <label>Image (URL or Upload)</label>
                <div className="image-input-group">
                  <input className={`input-field ${errors.img ? 'error-input' : ''}`} placeholder="https://..." value={form.img} onChange={e => setForm({...form, img: e.target.value})} />
                  <span className="or-divider">OR</span>
                  <button type="button" className="btn-secondary upload-btn" onClick={() => fileInputRef.current.click()}>
                    <Upload size={16} /> Upload
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} />
                </div>
                {errors.img && <span className="admin-error">{errors.img}</span>}
                {form.img && <div className="img-preview-container"><img src={form.img} alt="Preview" className="img-preview" /></div>}
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary"><Save size={16} /> {editingItem ? 'Save Changes' : 'Add Dish'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.getElementById('modal-root')
      )}

      {/* Add Rider Modal */}
      {showRiderModal && createPortal(
        <div className="admin-modal-overlay" onClick={() => setShowRiderModal(false)}>
          <div className="admin-modal glass-panel animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Add New Rider</h3>
              <button className="close-btn" onClick={() => setShowRiderModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddRider} className="admin-form">
              <div className="admin-form-group">
                <label>Rider Name</label>
                <input className="input-field" placeholder="Full Name" value={riderForm.name} onChange={e => setRiderForm({...riderForm, name: e.target.value})} required />
              </div>
              <div className="admin-form-group">
                <label>Phone Number (09XXXXXXXXX)</label>
                <input 
                  className={`input-field ${riderPhoneError ? 'error-input' : ''}`} 
                  required 
                  placeholder="09123456789" 
                  value={riderForm.phone} 
                  onChange={e => {
                    setRiderForm({...riderForm, phone: e.target.value});
                    setRiderPhoneError('');
                  }} 
                />
                {riderPhoneError && <span className="admin-error">{riderPhoneError}</span>}
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Vehicle Type</label>
                  <select className="input-field admin-select" value={riderForm.vehicle} onChange={e => setRiderForm({...riderForm, vehicle: e.target.value})}>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Car">Car</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Plate Number</label>
                  <input className="input-field" placeholder="ABC-1234" value={riderForm.plate} onChange={e => setRiderForm({...riderForm, plate: e.target.value})} />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Vehicle Model</label>
                <input className="input-field" placeholder="e.g. Honda Click 125i" value={riderForm.model} onChange={e => setRiderForm({...riderForm, model: e.target.value})} />
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowRiderModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Rider</button>
              </div>
            </form>
          </div>
        </div>,
        document.getElementById('modal-root')
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && createPortal(
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal admin-modal--sm glass-panel animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="delete-confirm-icon"><Trash2 size={32} /></div>
            <h3>Delete this dish?</h3>
            <p>This action cannot be undone.</p>
            <div className="admin-modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>No</button>
              <button className="btn-primary danger-btn" onClick={() => handleDelete(deleteConfirm)}>Yes</button>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root')
      )}
    </>
  );
};

export default AdminDashboard;
