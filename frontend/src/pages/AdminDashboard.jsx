import { useState } from 'react';
import { useMenu } from '../context/MenuContext';
import { PlusCircle, Edit2, Trash2, X, Save, LayoutDashboard, UtensilsCrossed, Search } from 'lucide-react';
import './AdminDashboard.css';

const CATEGORIES = ['Mains', 'Soups', 'Noodles', 'Starters', 'Desserts', 'Drinks'];

const emptyForm = { name: '', price: '', category: 'Mains', img: '', rating: 4.5 };

const AdminDashboard = () => {
  const { menuItems, addMenuItem, editMenuItem, deleteMenuItem } = useMenu();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAdd = () => {
    setEditingItem(null);
    setForm(emptyForm);
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
    if (!form.img.trim()) e.img = 'Image URL is required.';
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

  return (
    <div className="admin-page container animate-fade-in">
      <div className="admin-page-header">
        <div className="admin-title-group">
          <LayoutDashboard size={32} className="admin-title-icon" />
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage your Filipino menu items</p>
          </div>
        </div>
        <button className="btn-primary add-food-btn" onClick={openAdd}>
          <PlusCircle size={18} /> Add New Dish
        </button>
      </div>

      <div className="admin-stats glass-panel">
        <div className="stat-card">
          <span className="stat-value">{menuItems.length}</span>
          <span className="stat-label">Total Dishes</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{[...new Set(menuItems.map(i => i.category))].length}</span>
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

      <div className="admin-section glass-panel">
        <div className="admin-section-header">
          <h2><UtensilsCrossed size={22} /> Menu Items ({filteredItems.length})</h2>
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
                <th>Reviews</th>
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
                  <td>{item.reviews.length}</td>
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
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="admin-form-group">
                <label>Image URL</label>
                <input className={`input-field ${errors.img ? 'error-input' : ''}`} placeholder="https://... or /images/adobo.png" value={form.img} onChange={e => setForm({...form, img: e.target.value})} />
                {errors.img && <span className="admin-error">{errors.img}</span>}
                {form.img && <img src={form.img} alt="Preview" className="img-preview" onError={e => e.target.style.display='none'} />}
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
            <p>This action cannot be undone. The item will be removed from the entire menu.</p>
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
