import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../../firebase/firebaseConfig';
import './ElectronicsLabKitManagement.css';

const ElectronicsLabKitManagement = () => {
  const [kits, setKits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState('add');
  const [currentKitId, setCurrentKitId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [wiringDiagramFile, setWiringDiagramFile] = useState(null);
  const [wiringDiagramPreview, setWiringDiagramPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    tags: '',
    projectUrl: '',
    githubUrl: '',
    imageUrl: '',
    wiringDiagramUrl: '',
    howItWorks: '',
    codeExplanation: '',
    active: true,
    components: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchKits();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesQuery = query(collection(db, 'labKitCategories'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(categoriesQuery);
      
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchKits = async () => {
    try {
      setLoading(true);
      const kitsQuery = query(collection(db, 'electronicsLabKits'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(kitsQuery);
      
      const kitsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setKits(kitsData);
    } catch (error) {
      console.error('Error fetching electronics lab kits:', error);
      alert('Failed to load electronics lab kits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      await addDoc(collection(db, 'labKitCategories'), {
        name: categoryName,
        description: categoryDescription,
        createdAt: serverTimestamp()
      });
      alert('Category added successfully!');
      setCategoryName('');
      setCategoryDescription('');
      setShowCategoryModal(false);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category. Please try again.');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'labKitCategories', categoryId));
      alert('Category deleted successfully!');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If "add-new-category" is selected, open the modal
    if (name === 'categoryId' && value === 'add-new-category') {
      setShowCategoryModal(true);
      return;
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWiringDiagramChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setWiringDiagramFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setWiringDiagramPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file, folder = 'electronics-lab-kits') => {
    if (!file) return null;

    try {
      setIsUploading(true);
      const fileName = `${folder}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            setIsUploading(false);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setIsUploading(false);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      setIsUploading(false);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.categoryId) {
      alert('Please fill in all required fields including category');
      return;
    }

    try {
      setLoading(true);
      let imageUrl = formData.imageUrl;
      let wiringDiagramUrl = formData.wiringDiagramUrl;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'electronics-lab-kits');
      }

      if (wiringDiagramFile) {
        wiringDiagramUrl = await uploadImage(wiringDiagramFile, 'electronics-lab-kits/wiring-diagrams');
      }

      const kitData = {
        ...formData,
        imageUrl,
        wiringDiagramUrl,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        components: formData.components.split(',').map(comp => comp.trim()).filter(comp => comp),
        updatedAt: serverTimestamp()
      };

      if (formMode === 'add') {
        kitData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'electronicsLabKits'), kitData);
        alert('Electronics lab kit added successfully!');
      } else {
        await updateDoc(doc(db, 'electronicsLabKits', currentKitId), kitData);
        alert('Electronics lab kit updated successfully!');
      }

      resetForm();
      fetchKits();
    } catch (error) {
      console.error('Error saving electronics lab kit:', error);
      alert('Failed to save electronics lab kit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (kit) => {
    setFormMode('edit');
    setCurrentKitId(kit.id);
    setFormData({
      title: kit.title || '',
      description: kit.description || '',
      categoryId: kit.categoryId || '',
      tags: Array.isArray(kit.tags) ? kit.tags.join(', ') : '',
      projectUrl: kit.projectUrl || '',
      githubUrl: kit.githubUrl || '',
      imageUrl: kit.imageUrl || '',
      wiringDiagramUrl: kit.wiringDiagramUrl || '',
      howItWorks: kit.howItWorks || '',
      codeExplanation: kit.codeExplanation || '',
      active: kit.active ?? true,
      components: Array.isArray(kit.components) ? kit.components.join(', ') : ''
    });
    setImagePreview(kit.imageUrl || null);
    setWiringDiagramPreview(kit.wiringDiagramUrl || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (kitId, imageUrl, wiringDiagramUrl) => {
    if (!window.confirm('Are you sure you want to delete this electronics lab kit?')) {
      return;
    }

    try {
      setLoading(true);
      
      if (imageUrl) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }

      if (wiringDiagramUrl) {
        try {
          const diagramRef = ref(storage, wiringDiagramUrl);
          await deleteObject(diagramRef);
        } catch (error) {
          console.error('Error deleting wiring diagram:', error);
        }
      }

      await deleteDoc(doc(db, 'electronicsLabKits', kitId));
      alert('Electronics lab kit deleted successfully!');
      fetchKits();
    } catch (error) {
      console.error('Error deleting electronics lab kit:', error);
      alert('Failed to delete electronics lab kit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormMode('add');
    setCurrentKitId(null);
    setFormData({
      title: '',
      description: '',
      categoryId: '',
      tags: '',
      projectUrl: '',
      githubUrl: '',
      imageUrl: '',
      wiringDiagramUrl: '',
      howItWorks: '',
      codeExplanation: '',
      active: true,
      components: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setWiringDiagramFile(null);
    setWiringDiagramPreview(null);
    setUploadProgress(0);
  };

  const toggleStatus = async (kitId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'electronicsLabKits', kitId), {
        active: !currentStatus,
        updatedAt: serverTimestamp()
      });
      fetchKits();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  return (
    <div className="electronics-lab-kit-management">
      <div className="management-header">
        <h1>Electronics Lab Kit Management</h1>
        <button className="btn-add-category" onClick={() => setShowCategoryModal(true)}>
          <i className="fas fa-plus"></i> Manage Categories
        </button>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="lab-kit-modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="lab-kit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="lab-kit-modal-header">
              <h2>Manage Categories ({categories.length} total)</h2>
              <button className="lab-kit-modal-close" onClick={() => setShowCategoryModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="lab-kit-categories-list">
              <h3>Existing Categories</h3>
              {categories.length === 0 ? (
                <p className="no-data">No categories found. Add your first category below!</p>
              ) : (
                <div className="lab-kit-category-items">
                  {categories.map((category) => (
                    <div key={category.id} className="lab-kit-category-item">
                      <div className="lab-kit-category-info">
                        <h4>{category.name}</h4>
                        {category.description && <p>{category.description}</p>}
                      </div>
                      <button
                        className="lab-kit-btn-delete-small"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form className="lab-kit-category-form" onSubmit={handleAddCategory}>
              <h3>Add New Category</h3>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., Arduino Kits, IoT Kits, Robotics Kits"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Brief description of this category..."
                  rows="3"
                />
              </div>
              <button type="submit" className="btn-submit">
                <i className="fas fa-plus"></i> Add Category
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="kit-form-header">
        <h2>{formMode === 'add' ? 'Add New Electronics Lab Kit' : 'Edit Electronics Lab Kit'}</h2>
        {formMode === 'edit' && (
          <button className="btn-cancel" onClick={resetForm}>
            Cancel Edit
          </button>
        )}
      </div>

      <form className="kit-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Kit Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Smart Home Automation Kit"
              required
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              <option value="add-new-category" style={{color: '#667eea', fontWeight: 'bold'}}>
                + Add New Category
              </option>
              {categories.length > 0 && <option disabled>──────────</option>}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <small style={{color: '#dc3545', marginTop: '5px', display: 'block'}}>
                No categories available. Please add a category first.
              </small>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Detailed description of the electronics lab kit..."
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleInputChange}
              id="activeStatus"
            />
            <label htmlFor="activeStatus">Active</label>
          </div>
        </div>

        <div className="form-group">
          <label>Components Used (comma-separated)</label>
          <input
            type="text"
            name="components"
            value={formData.components}
            onChange={handleInputChange}
            placeholder="e.g., Arduino Uno, DHT11 Sensor, ESP8266"
          />
        </div>

        <div className="form-group">
          <label>Tags (comma-separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="e.g., Arduino, IoT, Home Automation"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Project URL</label>
            <input
              type="url"
              name="projectUrl"
              value={formData.projectUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/project"
            />
          </div>

          <div className="form-group">
            <label>GitHub URL</label>
            <input
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleInputChange}
              placeholder="https://github.com/username/repo"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Kit Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
          {isUploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>How It Works</label>
          <textarea
            name="howItWorks"
            value={formData.howItWorks}
            onChange={handleInputChange}
            placeholder="Explain how the kit/project works..."
            rows="6"
          />
        </div>

        <div className="form-group">
          <label>Wiring Diagram</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleWiringDiagramChange}
          />
          {wiringDiagramPreview && (
            <div className="image-preview">
              <img src={wiringDiagramPreview} alt="Wiring Diagram Preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Code Explanation</label>
          <textarea
            name="codeExplanation"
            value={formData.codeExplanation}
            onChange={handleInputChange}
            placeholder="Explain the code and how it works..."
            rows="6"
          />
        </div>

        <button 
          type="submit" 
          className="btn-submit" 
          disabled={isUploading || loading}
        >
          {formMode === 'add' ? 'Add Electronics Lab Kit' : 'Update Electronics Lab Kit'}
        </button>
      </form>

      <div className="kits-list">
        <h2>Electronics Lab Kits List</h2>
        {loading && kits.length === 0 ? (
          <div className="loading">Loading electronics lab kits...</div>
        ) : kits.length === 0 ? (
          <div className="no-data">No electronics lab kits found. Add your first kit!</div>
        ) : (
          <div className="kits-grid">
            {kits.map((kit) => (
              <div key={kit.id} className="kit-card">
                {kit.imageUrl && (
                  <div className="kit-image">
                    <img src={kit.imageUrl} alt={kit.title} />
                    <span className={`status-badge ${kit.active ? 'active' : 'inactive'}`}>
                      {kit.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                )}
                <div className="kit-content">
                  <h3>{kit.title}</h3>
                  <p className="kit-category">{getCategoryName(kit.categoryId)}</p>
                  <p className="kit-description">{kit.description}</p>

                  {kit.tags && kit.tags.length > 0 && (
                    <div className="kit-tags">
                      {kit.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}

                  {kit.components && kit.components.length > 0 && (
                    <div className="kit-section">
                      <strong>Components:</strong>
                      <p>{kit.components.join(', ')}</p>
                    </div>
                  )}

                  {kit.howItWorks && (
                    <div className="kit-section">
                      <strong>How It Works:</strong>
                      <p>{kit.howItWorks}</p>
                    </div>
                  )}

                  {kit.wiringDiagramUrl && (
                    <div className="kit-section">
                      <strong>Wiring Diagram:</strong>
                      <div className="wiring-diagram">
                        <img src={kit.wiringDiagramUrl} alt="Wiring Diagram" />
                      </div>
                    </div>
                  )}

                  {kit.codeExplanation && (
                    <div className="kit-section">
                      <strong>Code Explanation:</strong>
                      <p>{kit.codeExplanation}</p>
                    </div>
                  )}

                  <div className="kit-links">
                    {kit.projectUrl && (
                      <a href={kit.projectUrl} target="_blank" rel="noopener noreferrer">
                        <i className="fas fa-external-link-alt"></i> View Project
                      </a>
                    )}
                    {kit.githubUrl && (
                      <a href={kit.githubUrl} target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-github"></i> GitHub
                      </a>
                    )}
                  </div>

                  <div className="kit-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEdit(kit)}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button 
                      className="btn-toggle" 
                      onClick={() => toggleStatus(kit.id, kit.active)}
                    >
                      <i className={`fas fa-${kit.active ? 'eye-slash' : 'eye'}`}></i>
                      {kit.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(kit.id, kit.imageUrl, kit.wiringDiagramUrl)}
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectronicsLabKitManagement;
