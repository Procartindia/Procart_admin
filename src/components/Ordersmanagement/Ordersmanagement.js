





// import React, { useState, useEffect } from 'react';
// import { 
//   collection, 
//   query, 
//   orderBy, 
//   getDocs, 
//   doc, 
//   updateDoc, 
//   getDoc,
//   where, 
//   Timestamp 
// } from 'firebase/firestore';
// import { db } from '../../firebase/firebaseConfig';
// import './Ordersmanagement.css';

// const OrdersManagement = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [showDetails, setShowDetails] = useState(false);
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [dateRange, setDateRange] = useState({ from: '', to: '' });
//   const [searchTerm, setSearchTerm] = useState('');
//   const [updateStatusLoading, setUpdateStatusLoading] = useState(false);

//   // Define order status options - normalize "pending" to "Pending Payment"
//   const statusOptions = [
//     'all',
//     'Pending Payment',
//     'Processing',
//     'Shipped',
//     'Delivered',
//     'Cancelled'
//   ];

//   // Map internal status values to display values
//   const statusMapping = {
//     'pending': 'Pending Payment',
//     'Pending Payment': 'Pending Payment',
//     'Processing': 'Processing',
//     'Shipped': 'Shipped',
//     'Delivered': 'Delivered',
//     'Cancelled': 'Cancelled',
//     'all': 'All Statuses'
//   };

//   // Map display values back to internal values for queries
//   const reverseStatusMapping = {
//     'Pending Payment': ['pending', 'Pending Payment'],
//     'Processing': ['Processing'],
//     'Shipped': ['Shipped'],
//     'Delivered': ['Delivered'],
//     'Cancelled': ['Cancelled'],
//     'all': ['pending', 'Pending Payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
//   };

//   // Fetch orders from Firestore
//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         let ordersData = [];
        
//         // If we're filtering by a specific status, use the mapping to get all possible internal values
//         if (statusFilter !== 'all') {
//           const statusValues = reverseStatusMapping[statusFilter] || [statusFilter];
          
//           // For each possible status value, perform a query
//           for (const statusValue of statusValues) {
//             // Try to fetch orders with orderDate
//             try {
//               const orderDateQuery = query(
//                 collection(db, 'orders'),
//                 where('status', '==', statusValue),
//                 orderBy('orderDate', 'desc')
//               );
              
//               const querySnapshot = await getDocs(orderDateQuery);
//               querySnapshot.forEach((doc) => {
//                 const orderData = doc.data();
//                 if (orderData.orderDate) {
//                   ordersData.push({
//                     id: doc.id,
//                     ...orderData,
//                     orderDate: orderData.orderDate instanceof Timestamp 
//                       ? orderData.orderDate.toDate() 
//                       : new Date(orderData.orderDate)
//                   });
//                 }
//               });
//             } catch (err) {
//               console.warn("Error fetching orders with orderDate:", err);
//             }
            
//             // Try to fetch orders with createdAt
//             try {
//               const createdAtQuery = query(
//                 collection(db, 'orders'),
//                 where('status', '==', statusValue),
//                 orderBy('createdAt', 'desc')
//               );
              
//               const createdAtSnapshot = await getDocs(createdAtQuery);
//               createdAtSnapshot.forEach((doc) => {
//                 const orderData = doc.data();
//                 // Only add if not already added (to prevent duplicates)
//                 if (orderData.createdAt && !ordersData.some(o => o.id === doc.id)) {
//                   ordersData.push({
//                     id: doc.id,
//                     ...orderData,
//                     orderDate: orderData.createdAt instanceof Timestamp 
//                       ? orderData.createdAt.toDate() 
//                       : new Date(orderData.createdAt)
//                   });
//                 }
//               });
//             } catch (err) {
//               console.warn("Error fetching orders with createdAt:", err);
//             }
//           }
//         } else {
//           // Fetch all orders regardless of status
          
//           // First try to fetch orders with orderDate
//           try {
//             const orderDateQuery = query(
//               collection(db, 'orders'),
//               orderBy('orderDate', 'desc')
//             );
            
//             const querySnapshot = await getDocs(orderDateQuery);
//             querySnapshot.forEach((doc) => {
//               const orderData = doc.data();
//               if (orderData.orderDate) {
//                 ordersData.push({
//                   id: doc.id,
//                   ...orderData,
//                   orderDate: orderData.orderDate instanceof Timestamp 
//                     ? orderData.orderDate.toDate() 
//                     : new Date(orderData.orderDate)
//                 });
//               }
//             });
//           } catch (err) {
//             console.warn("Error fetching all orders with orderDate:", err);
//           }
          
//           // Then try to fetch orders with createdAt
//           try {
//             const createdAtQuery = query(
//               collection(db, 'orders'),
//               orderBy('createdAt', 'desc')
//             );
            
//             const createdAtSnapshot = await getDocs(createdAtQuery);
//             createdAtSnapshot.forEach((doc) => {
//               const orderData = doc.data();
//               // Only add if not already added (to prevent duplicates)
//               if (orderData.createdAt && !ordersData.some(o => o.id === doc.id)) {
//                 ordersData.push({
//                   id: doc.id,
//                   ...orderData,
//                   orderDate: orderData.createdAt instanceof Timestamp 
//                     ? orderData.createdAt.toDate() 
//                     : new Date(orderData.createdAt)
//                 });
//               }
//             });
//           } catch (err) {
//             console.warn("Error fetching all orders with createdAt:", err);
//           }
//         }
        
//         // Sort combined results by date
//         ordersData.sort((a, b) => b.orderDate - a.orderDate);

//         // Apply date range filter if provided
//         if (dateRange.from && dateRange.to) {
//           const fromDate = new Date(dateRange.from);
//           const toDate = new Date(dateRange.to);
//           toDate.setHours(23, 59, 59, 999); // Set to end of day
          
//           ordersData = ordersData.filter(order => {
//             const orderDate = order.orderDate instanceof Date 
//               ? order.orderDate 
//               : new Date(order.orderDate);
            
//             return orderDate >= fromDate && orderDate <= toDate;
//           });
//         }

//         // Apply search filter if provided
//         if (searchTerm) {
//           const term = searchTerm.toLowerCase();
//           ordersData = ordersData.filter(order => 
//             order.id.toLowerCase().includes(term) || 
//             (order.userId && order.userId.toLowerCase().includes(term)) ||
//             (order.customerName && order.customerName.toLowerCase().includes(term)) ||
//             (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(term)) ||
//             (order.productName && order.productName.toLowerCase().includes(term))
//           );
//         }

//         console.log("Fetched orders:", ordersData);
//         setOrders(ordersData);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching orders:", err);
//         setError("Failed to load orders. Please try again.");
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, [statusFilter, dateRange, searchTerm]);

//   // Update order status - improved with better error handling
//   const updateOrderStatus = async (orderId, newStatus) => {
//     try {
//       setUpdateStatusLoading(true);
//       const orderRef = doc(db, 'orders', orderId);
      
//       // Get current order to check fields
//       const orderSnap = await getDoc(orderRef);
//       if (!orderSnap.exists()) {
//         throw new Error("Order not found");
//       }
      
//       // Update the status and lastUpdated fields
//       const updateData = {
//         status: newStatus,
//         lastUpdated: new Date().toISOString()
//       };
      
//       await updateDoc(orderRef, updateData);
      
//       // Update the local state
//       setOrders(prevOrders => 
//         prevOrders.map(order => 
//           order.id === orderId 
//             ? { ...order, status: newStatus, lastUpdated: new Date().toISOString() } 
//             : order
//         )
//       );

//       // If this is the selected order, update it too
//       if (selectedOrder && selectedOrder.id === orderId) {
//         setSelectedOrder(prev => ({ ...prev, status: newStatus, lastUpdated: new Date().toISOString() }));
//       }
      
//       alert(`Order status updated to ${statusMapping[newStatus] || newStatus}`);
//     } catch (error) {
//       console.error("Error updating order status:", error);
//       alert(`Failed to update order status: ${error.message}`);
//     } finally {
//       setUpdateStatusLoading(false);
//     }
//   };

//   // View order details - improved error handling
//   const viewOrderDetails = async (orderId) => {
//     try {
//       const orderRef = doc(db, 'orders', orderId);
//       const orderSnap = await getDoc(orderRef);
      
//       if (orderSnap.exists()) {
//         const orderData = orderSnap.data();
        
//         // Determine which timestamp field to use
//         let orderDate;
//         if (orderData.orderDate) {
//           orderDate = orderData.orderDate instanceof Timestamp 
//             ? orderData.orderDate.toDate() 
//             : new Date(orderData.orderDate);
//         } else if (orderData.createdAt) {
//           orderDate = orderData.createdAt instanceof Timestamp 
//             ? orderData.createdAt.toDate() 
//             : new Date(orderData.createdAt);
//         } else {
//           orderDate = new Date(); // Fallback
//         }
        
//         setSelectedOrder({
//           id: orderSnap.id,
//           ...orderData,
//           orderDate
//         });
//         setShowDetails(true);
//       } else {
//         alert("Order not found!");
//       }
//     } catch (error) {
//       console.error("Error fetching order details:", error);
//       alert("Failed to load order details. Please try again.");
//     }
//   };

//   // Format date for display
//   const formatDate = (date) => {
//     if (!date) return 'N/A';
    
//     const d = date instanceof Date ? date : new Date(date);
    
//     if (isNaN(d.getTime())) return 'Invalid Date';
    
//     return d.toLocaleString('en-IN', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   // Get appropriate status class for styling
//   const getStatusClass = (status) => {
//     const normalizedStatus = status.toLowerCase();
//     if (normalizedStatus === 'pending' || normalizedStatus === 'pending payment') {
//       return 'status-pending';
//     } else if (normalizedStatus === 'processing') {
//       return 'status-processing';
//     } else if (normalizedStatus === 'shipped') {
//       return 'status-shipped';
//     } else if (normalizedStatus === 'delivered') {
//       return 'status-delivered';
//     } else if (normalizedStatus === 'cancelled') {
//       return 'status-cancelled';
//     }
//     return '';
//   };

//   // Get formatted status for display
//   const getFormattedStatus = (status) => {
//     return statusMapping[status] || status;
//   };

//   // Reset all filters
//   const resetFilters = () => {
//     setStatusFilter('all');
//     setDateRange({ from: '', to: '' });
//     setSearchTerm('');
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="orders-loading">
//         <div className="spinner"></div>
//         <p>Loading orders...</p>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="orders-error">
//         <h2>Error</h2>
//         <p>{error}</p>
//         <button onClick={() => window.location.reload()}>Retry</button>
//       </div>
//     );
//   }

//   return (
//     <div className="orders-management">
//       <h1>Orders Management</h1>
      
//       {/* Filters Section */}
//       <div className="filters-section">
//         <div className="filter-group">
//           <label>Status:</label>
//           <select 
//             value={statusFilter} 
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="status-select"
//           >
//             {statusOptions.map(status => (
//               <option key={status} value={status}>
//                 {status === 'all' ? 'All Statuses' : status}
//               </option>
//             ))}
//           </select>
//         </div>
        
//         <div className="filter-group">
//           <label>Date Range:</label>
//           <input 
//             type="date" 
//             value={dateRange.from} 
//             onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
//             placeholder="From"
//             className="date-input"
//           />
//           <input 
//             type="date" 
//             value={dateRange.to} 
//             onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
//             placeholder="To"
//             className="date-input"
//           />
//         </div>
        
//         <div className="filter-group">
//           <label>Search:</label>
//           <input 
//             type="text" 
//             value={searchTerm} 
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder="Order ID, Customer, Address..."
//             className="search-input"
//           />
//         </div>
        
//         <button className="reset-filters-btn" onClick={resetFilters}>
//           Reset Filters
//         </button>
//       </div>
      
//       {/* Orders Table */}
//       <div className="orders-table-container">
//         {orders.length === 0 ? (
//           <div className="no-orders">
//             <p>No orders found matching the current filters.</p>
//             <button onClick={resetFilters}>Reset Filters</button>
//           </div>
//         ) : (
//           <table className="orders-table">
//             <thead>
//               <tr>
//                 <th>Order ID</th>
//                 <th>Date</th>
//                 <th>Customer</th>
//                 <th>Total Amount</th>
//                 <th>Payment Method</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {orders.map((order) => (
//                 <tr key={order.id}>
//                   <td>{order.id.substring(0, 8)}...</td>
//                   <td>{formatDate(order.orderDate)}</td>
//                   <td>
//                     {order.customerName || (order.userId && order.userId.substring(0, 8)) || 'Unknown'}
//                   </td>
//                   <td>₹{order.totalAmount ? order.totalAmount.toLocaleString('en-IN') : 'N/A'}</td>
//                   <td>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'online' ? 'Online Payment' : 'Razorpay'}</td>
//                   <td>
//                     <span className={`status-badge ${getStatusClass(order.status)}`}>
//                       {getFormattedStatus(order.status)}
//                     </span>
//                   </td>
//                   <td>
//                     <div className="action-buttons">
//                       <button 
//                         className="view-btn"
//                         onClick={() => viewOrderDetails(order.id)}
//                       >
//                         View
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
      
//       {/* Order Details Modal */}
//       {showDetails && selectedOrder && (
//         <div className="order-details-modal">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h2>Order Details</h2>
//               <button 
//                 className="close-btn"
//                 onClick={() => {
//                   setShowDetails(false);
//                   setSelectedOrder(null);
//                 }}
//               >
//                 &times;
//               </button>
//             </div>
            
//             <div className="modal-body">
//               <div className="order-info">
//                 <div className="info-group">
//                   <span className="label">Order ID:</span>
//                   <span className="value">{selectedOrder.id}</span>
//                 </div>
//                 <div className="info-group">
//                   <span className="label">Order Date:</span>
//                   <span className="value">{formatDate(selectedOrder.orderDate)}</span>
//                 </div>
//                 <div className="info-group">
//                   <span className="label">Status:</span>
//                   <span className={`value status-badge ${getStatusClass(selectedOrder.status)}`}>
//                     {getFormattedStatus(selectedOrder.status)}
//                   </span>
//                 </div>
//                 <div className="info-group">
//                   <span className="label">Payment Method:</span>
//                   <span className="value">
//                     {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 
//                      selectedOrder.paymentMethod === 'online' ? 'Online Payment' : 'Razorpay'}
//                   </span>
//                 </div>
//                 {selectedOrder.paymentId && (
//                   <div className="info-group">
//                     <span className="label">Payment ID:</span>
//                     <span className="value">{selectedOrder.paymentId}</span>
//                   </div>
//                 )}
//                 <div className="info-group">
//                   <span className="label">Customer ID:</span>
//                   <span className="value">{selectedOrder.userId || 'N/A'}</span>
//                 </div>
//                 {selectedOrder.customerName && (
//                   <div className="info-group">
//                     <span className="label">Customer Name:</span>
//                     <span className="value">{selectedOrder.customerName}</span>
//                   </div>
//                 )}
//                 <div className="info-group">
//                   <span className="label">Delivery Address:</span>
//                   <span className="value">{selectedOrder.deliveryAddress || 'N/A'}</span>
//                 </div>
//                 {selectedOrder.deliveryOption && (
//                   <div className="info-group">
//                     <span className="label">Delivery Option:</span>
//                     <span className="value">{selectedOrder.deliveryOption}</span>
//                   </div>
//                 )}
//               </div>
              
//               <div className="order-items">
//                 <h3>Order Items</h3>
//                 <table className="items-table">
//                   <thead>
//                     <tr>
//                       <th>Item</th>
//                       <th>Price</th>
//                       <th>Quantity</th>
//                       <th>Total</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {selectedOrder.items && selectedOrder.items.length > 0 ? (
//                       // For orders created from cart
//                       selectedOrder.items.map((item, index) => (
//                         <tr key={index}>
//                           <td>{item.name || 'Unknown Item'}</td>
//                           <td>₹{item.price ? item.price.toLocaleString('en-IN') : 'N/A'}</td>
//                           <td>{item.quantity || 1}</td>
//                           <td>₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</td>
//                         </tr>
//                       ))
//                     ) : selectedOrder.productName ? (
//                       // For orders created from product details page
//                       <tr>
//                         <td>{selectedOrder.productName}</td>
//                         <td>₹{selectedOrder.price ? selectedOrder.price.toLocaleString('en-IN') : 'N/A'}</td>
//                         <td>{selectedOrder.quantity || 1}</td>
//                         <td>₹{((selectedOrder.price || 0) * (selectedOrder.quantity || 1)).toLocaleString('en-IN')}</td>
//                       </tr>
//                     ) : (
//                       // Fallback if no item info is available
//                       <tr>
//                         <td colSpan="4">No item details available</td>
//                       </tr>
//                     )}
//                   </tbody>
//                   <tfoot>
//                     <tr>
//                       <td colSpan="3" className="total-label">Total Amount:</td>
//                       <td className="total-value">₹{selectedOrder.totalAmount ? selectedOrder.totalAmount.toLocaleString('en-IN') : 'N/A'}</td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>
              
//               <div className="action-section">
//                 <h3>Update Order Status</h3>
//                 <div className="status-update-controls">
//                   <select 
//                     value={selectedOrder.status}
//                     onChange={(e) => {
//                       setSelectedOrder(prev => ({ ...prev, status: e.target.value }));
//                     }}
//                     className="status-update-select"
//                     disabled={updateStatusLoading}
//                   >
//                     {statusOptions.filter(status => status !== 'all').map(status => (
//                       <option key={status} value={status === 'Pending Payment' ? 'pending' : status}>
//                         {status}
//                       </option>
//                     ))}
//                   </select>
//                   <button 
//                     className="update-status-btn"
//                     onClick={() => updateOrderStatus(selectedOrder.id, selectedOrder.status)}
//                     disabled={updateStatusLoading}
//                   >
//                     {updateStatusLoading ? 'Updating...' : 'Update Status'}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrdersManagement;





import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc,
  where, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import './Ordersmanagement.css';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  
  // Create ref for search input to maintain focus
  const searchInputRef = useRef(null);

  // Define order status options - normalize "pending" to "Pending Payment"
  const statusOptions = [
    'all',
  ];

  // Map internal status values to display values
  const statusMapping = {
    'pending': 'Pending Payment',
    'Pending Payment': 'Pending Payment',
    'Processing': 'Processing',
    'Shipped': 'Shipped',
    'Delivered': 'Delivered',
    'Cancelled': 'Cancelled',
    'all': 'All Statuses'
  };

  // Map display values back to internal values for queries
  const reverseStatusMapping = {
    'Pending Payment': ['pending', 'Pending Payment'],
    'Processing': ['Processing'],
    'Shipped': ['Shipped'],
    'Delivered': ['Delivered'],
    'Cancelled': ['Cancelled'],
    'all': ['pending', 'Pending Payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
  };

  // Debounce search term to prevent excessive re-renders
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Parse date in the format dd-mm-yyyy to a valid Date object
  const parseDateString = (dateString) => {
    if (!dateString) return null;
    
    // If date is already in YYYY-MM-DD format (from HTML date input)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return new Date(dateString);
    }
    
    // Parse dd-mm-yyyy format
    const parts = dateString.split('-');
    if (parts.length === 3) {
      // Create date as MM/DD/YYYY for reliable parsing
      return new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
    }
    
    // Fallback - try direct parsing (less reliable)
    return new Date(dateString);
  };

  // Fetch orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let ordersData = [];
        
        // If we're filtering by a specific status, use the mapping to get all possible internal values
        if (statusFilter !== 'all') {
          const statusValues = reverseStatusMapping[statusFilter] || [statusFilter];
          
          // For each possible status value, perform a query
          for (const statusValue of statusValues) {
            // Try to fetch orders with orderDate
            try {
              const orderDateQuery = query(
                collection(db, 'orders'),
                where('status', '==', statusValue),
                orderBy('orderDate', 'desc')
              );
              
              const querySnapshot = await getDocs(orderDateQuery);
              querySnapshot.forEach((doc) => {
                const orderData = doc.data();
                if (orderData.orderDate) {
                  ordersData.push({
                    id: doc.id,
                    ...orderData,
                    orderDate: orderData.orderDate instanceof Timestamp 
                      ? orderData.orderDate.toDate() 
                      : new Date(orderData.orderDate)
                  });
                }
              });
            } catch (err) {
              console.warn("Error fetching orders with orderDate:", err);
            }
            
            // Try to fetch orders with createdAt
            try {
              const createdAtQuery = query(
                collection(db, 'orders'),
                where('status', '==', statusValue),
                orderBy('createdAt', 'desc')
              );
              
              const createdAtSnapshot = await getDocs(createdAtQuery);
              createdAtSnapshot.forEach((doc) => {
                const orderData = doc.data();
                // Only add if not already added (to prevent duplicates)
                if (orderData.createdAt && !ordersData.some(o => o.id === doc.id)) {
                  ordersData.push({
                    id: doc.id,
                    ...orderData,
                    orderDate: orderData.createdAt instanceof Timestamp 
                      ? orderData.createdAt.toDate() 
                      : new Date(orderData.createdAt)
                  });
                }
              });
            } catch (err) {
              console.warn("Error fetching orders with createdAt:", err);
            }
          }
        } else {
          // Fetch all orders regardless of status
          
          // First try to fetch orders with orderDate
          try {
            const orderDateQuery = query(
              collection(db, 'orders'),
              orderBy('orderDate', 'desc')
            );
            
            const querySnapshot = await getDocs(orderDateQuery);
            querySnapshot.forEach((doc) => {
              const orderData = doc.data();
              if (orderData.orderDate) {
                ordersData.push({
                  id: doc.id,
                  ...orderData,
                  orderDate: orderData.orderDate instanceof Timestamp 
                    ? orderData.orderDate.toDate() 
                    : new Date(orderData.orderDate)
                });
              }
            });
          } catch (err) {
            console.warn("Error fetching all orders with orderDate:", err);
          }
          
          // Then try to fetch orders with createdAt
          try {
            const createdAtQuery = query(
              collection(db, 'orders'),
              orderBy('createdAt', 'desc')
            );
            
            const createdAtSnapshot = await getDocs(createdAtQuery);
            createdAtSnapshot.forEach((doc) => {
              const orderData = doc.data();
              // Only add if not already added (to prevent duplicates)
              if (orderData.createdAt && !ordersData.some(o => o.id === doc.id)) {
                ordersData.push({
                  id: doc.id,
                  ...orderData,
                  orderDate: orderData.createdAt instanceof Timestamp 
                    ? orderData.createdAt.toDate() 
                    : new Date(orderData.createdAt)
                });
              }
            });
          } catch (err) {
            console.warn("Error fetching all orders with createdAt:", err);
          }
        }
        
        // Sort combined results by date
        ordersData.sort((a, b) => b.orderDate - a.orderDate);

        // Apply date range filter if provided
        if (dateRange.from && dateRange.to) {
          const fromDate = parseDateString(dateRange.from);
          const toDate = parseDateString(dateRange.to);
          
          if (fromDate && toDate) {
            // Set toDate to end of day for inclusive range
            toDate.setHours(23, 59, 59, 999);
            
            console.log("Filtering by date range:", {
              from: fromDate.toISOString(),
              to: toDate.toISOString()
            });
            
            ordersData = ordersData.filter(order => {
              const orderDate = order.orderDate instanceof Date 
                ? order.orderDate 
                : new Date(order.orderDate);
              
              return orderDate >= fromDate && orderDate <= toDate;
            });
            
            console.log(`After date filtering: ${ordersData.length} orders remain`);
          } else {
            console.warn("Invalid date format in date range filter", { from: dateRange.from, to: dateRange.to });
          }
        }

        // Apply search filter if provided
        if (debouncedSearchTerm) {
          const term = debouncedSearchTerm.toLowerCase();
          const beforeCount = ordersData.length;
          
          ordersData = ordersData.filter(order => 
            order.id.toLowerCase().includes(term) || 
            (order.userId && order.userId.toLowerCase().includes(term)) ||
            (order.customerName && order.customerName.toLowerCase().includes(term)) ||
            (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(term)) ||
            (order.productName && order.productName.toLowerCase().includes(term))
          );
          
          console.log(`Search filtering: ${beforeCount} → ${ordersData.length} orders`);
        }

        console.log("Fetched orders:", ordersData);
        setOrders(ordersData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter, dateRange, debouncedSearchTerm]); // Use debouncedSearchTerm instead of searchTerm

  // Update order status - improved with better error handling
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdateStatusLoading(true);
      const orderRef = doc(db, 'orders', orderId);
      
      // Get current order to check fields
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) {
        throw new Error("Order not found");
      }
      
      // Update the status and lastUpdated fields
      const updateData = {
        status: newStatus,
        lastUpdated: new Date().toISOString()
      };
      
      await updateDoc(orderRef, updateData);
      
      // Update the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, lastUpdated: new Date().toISOString() } 
            : order
        )
      );

      // If this is the selected order, update it too
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus, lastUpdated: new Date().toISOString() }));
      }
      
      alert(`Order status updated to ${statusMapping[newStatus] || newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert(`Failed to update order status: ${error.message}`);
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  // View order details - improved error handling
  const viewOrderDetails = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        
        // Determine which timestamp field to use
        let orderDate;
        if (orderData.orderDate) {
          orderDate = orderData.orderDate instanceof Timestamp 
            ? orderData.orderDate.toDate() 
            : new Date(orderData.orderDate);
        } else if (orderData.createdAt) {
          orderDate = orderData.createdAt instanceof Timestamp 
            ? orderData.createdAt.toDate() 
            : new Date(orderData.createdAt);
        } else {
          orderDate = new Date(); // Fallback
        }
        
        setSelectedOrder({
          id: orderSnap.id,
          ...orderData,
          orderDate
        });
        setShowDetails(true);
      } else {
        alert("Order not found!");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      alert("Failed to load order details. Please try again.");
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    const d = date instanceof Date ? date : new Date(date);
    
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get appropriate status class for styling
  const getStatusClass = (status) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === 'pending' || normalizedStatus === 'pending payment') {
      return 'status-pending';
    } else if (normalizedStatus === 'processing') {
      return 'status-processing';
    } else if (normalizedStatus === 'shipped') {
      return 'status-shipped';
    } else if (normalizedStatus === 'delivered') {
      return 'status-delivered';
    } else if (normalizedStatus === 'cancelled') {
      return 'status-cancelled';
    }
    return '';
  };

  // Get formatted status for display
  const getFormattedStatus = (status) => {
    return statusMapping[status] || status;
  };

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter('all');
    setDateRange({ from: '', to: '' });
    setSearchTerm('');
    setDebouncedSearchTerm('');
    // Refocus the search input if it was being used
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Loading state
  if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="orders-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="orders-management">
      <h1>Orders Management</h1>
      
      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-select"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Date Range:</label>
          <input 
            type="date" 
            value={dateRange.from} 
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            className="date-input"
          />
          <input 
            type="date" 
            value={dateRange.to} 
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            className="date-input"
          />
        </div>
        
        <div className="filter-group">
          <label>Search:</label>
          <input 
            type="text" 
            value={searchTerm} 
            onChange={handleSearchChange}
            placeholder="Order ID, Customer, Address..."
            className="search-input"
            ref={searchInputRef}
          />
        </div>
        
        <button className="reset-filters-btn" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>
      
      {/* Orders Table */}
      <div className="orders-table-container">
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found matching the current filters.</p>
            <button onClick={resetFilters}>Reset Filters</button>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id.substring(0, 8)}...</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>
                    {order.customerName || (order.userId && order.userId.substring(0, 8)) || 'Unknown'}
                  </td>
                  <td>₹{order.totalAmount ? order.totalAmount.toLocaleString('en-IN') : 'N/A'}</td>
                  <td>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'online' ? 'Online Payment' : 'Razorpay'}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {getFormattedStatus(order.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="view-btn"
                        onClick={() => viewOrderDetails(order.id)}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="order-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Order Details</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowDetails(false);
                  setSelectedOrder(null);
                }}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-info">
                <div className="info-group">
                  <span className="label">Order ID:</span>
                  <span className="value">{selectedOrder.id}</span>
                </div>
                <div className="info-group">
                  <span className="label">Order Date:</span>
                  <span className="value">{formatDate(selectedOrder.orderDate)}</span>
                </div>
                <div className="info-group">
                  <span className="label">Status:</span>
                  <span className={`value status-badge ${getStatusClass(selectedOrder.status)}`}>
                    {getFormattedStatus(selectedOrder.status)}
                  </span>
                </div>
                <div className="info-group">
                  <span className="label">Payment Method:</span>
                  <span className="value">
                    {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                     selectedOrder.paymentMethod === 'online' ? 'Online Payment' : 'Razorpay'}
                  </span>
                </div>
                {selectedOrder.paymentId && (
                  <div className="info-group">
                    <span className="label">Payment ID:</span>
                    <span className="value">{selectedOrder.paymentId}</span>
                  </div>
                )}
                <div className="info-group">
                  <span className="label">Customer ID:</span>
                  <span className="value">{selectedOrder.userId || 'N/A'}</span>
                </div>
                {selectedOrder.customerName && (
                  <div className="info-group">
                    <span className="label">Customer Name:</span>
                    <span className="value">{selectedOrder.customerName}</span>
                  </div>
                )}
                <div className="info-group">
                  <span className="label">Delivery Address:</span>
                  <span className="value">{selectedOrder.deliveryAddress || 'N/A'}</span>
                </div>
                {selectedOrder.deliveryOption && (
                  <div className="info-group">
                    <span className="label">Delivery Option:</span>
                    <span className="value">{selectedOrder.deliveryOption}</span>
                  </div>
                )}
              </div>
              
              <div className="order-items">
                <h3>Order Items</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      // For orders created from cart
                      selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name || 'Unknown Item'}</td>
                          <td>₹{item.price ? item.price.toLocaleString('en-IN') : 'N/A'}</td>
                          <td>{item.quantity || 1}</td>
                          <td>₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    ) : selectedOrder.productName ? (
                      // For orders created from product details page
                      <tr>
                        <td>{selectedOrder.productName}</td>
                        <td>₹{selectedOrder.price ? selectedOrder.price.toLocaleString('en-IN') : 'N/A'}</td>
                        <td>{selectedOrder.quantity || 1}</td>
                        <td>₹{((selectedOrder.price || 0) * (selectedOrder.quantity || 1)).toLocaleString('en-IN')}</td>
                      </tr>
                    ) : (
                      // Fallback if no item info is available
                      <tr>
                        <td colSpan="4">No item details available</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="total-label">Total Amount:</td>
                      <td className="total-value">₹{selectedOrder.totalAmount ? selectedOrder.totalAmount.toLocaleString('en-IN') : 'N/A'}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="action-section">
                <h3>Update Order Status</h3>
                <div className="status-update-controls">
                  <select 
                    value={selectedOrder.status}
                    onChange={(e) => {
                      setSelectedOrder(prev => ({ ...prev, status: e.target.value }));
                    }}
                    className="status-update-select"
                    disabled={updateStatusLoading}
                  >
                    {statusOptions.filter(status => status !== 'all').map(status => (
                      <option key={status} value={status === 'Pending Payment' ? 'pending' : status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button 
                    className="update-status-btn"
                    onClick={() => updateOrderStatus(selectedOrder.id, selectedOrder.status)}
                    disabled={updateStatusLoading}
                  >
                    {updateStatusLoading ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;