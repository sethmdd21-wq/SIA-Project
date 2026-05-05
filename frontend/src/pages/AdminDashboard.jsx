import { useState, useRef } from 'react';
import { useMenu } from '../context/MenuContext';
import { PlusCircle, Edit2, Trash2, X, Save, LayoutDashboard, UtensilsCrossed, Search, MessageSquare, Tag, Upload, Reply } from 'lucide-react';
import './AdminDashboard.css';

const emptyForm = { name: '', price: '', category: 'Mains', img: '', rating: 4.5 };

const AdminDashboard = () => {
  const { menuItems, categories, addMenuItem, editMenuItem, deleteMenuItem, addCategory, deleteCategory, replyToReview } = useMenu();
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'categories', 'reviews'
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [replyText, setReplyText] = useState({});
  const fileInputRef = useRef(null);

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allReviews = menuItems.flatMap(item => 
    item.reviews.map(review => ({ ...review, dishId: item.id, dishName: item.name, dishImg: item.img }))
  ).sort((a, b) => b.id - a.id);

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

  return (
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
          <button className={`admin-tab ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
            <UtensilsCrossed size={18} /> Menu
          </button>
          <button className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
            <Tag size={18} /> Categories
          </button>
          <button className={`admin-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
            <MessageSquare size={18} /> Reviews
          </button>
        </div>
      </div>

      <div className="admin-stats glass-panel">
        <div className="stat-card">
          <span className="stat-value">{menuItems.length}</span>
          <span className="stat-label">Total Dishes</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{categories.length}</span>
          <span className="stat-label">Categories</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{menuItems.reduce((s, i) => s + i.reviews.length, 0)}</span>
          <span className="stat-label">Total Reviews</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{menuItems.length > 0 ? (menuItems.reduce((s,i)=>s+i.rating,0)/menuItems.length).toFixed(1) : '—'}</span>
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
                      <span className="review-meta">by {review.user} on {review.date}</span>
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal glass-panel animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingItem ? 'Edit Dish' : 'Add New Dish'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-group">
                <label>Dish Name</label>
                <input className={`input-field ${errors.name ? 'error-input' : ''}`} placeholder="e.g. Kare-Kare" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
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
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal admin-modal--sm glass-panel animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="delete-confirm-icon"><Trash2 size={32} /></div>
            <h3>Delete this dish?</h3>
            <p>This action cannot be undone.</p>
            <div className="admin-modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-primary danger-btn" onClick={() => handleDelete(deleteConfirm)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
