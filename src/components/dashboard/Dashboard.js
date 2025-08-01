// import React, { useState, useEffect } from 'react';
// import { 
//   collection, 
//   query, 
//   getDocs, 
//   onSnapshot,
//   where,
//   orderBy,
//   limit
// } from 'firebase/firestore';
// import { db } from '../../firebase/firebaseConfig';
// import './Dashboard.css';

// function Dashboard({ setMode }) {
//   // State for dashboard metrics
//   const [metrics, setMetrics] = useState({
//     users: 0,
//     orders: 0,
//     products: 0,
//     revenue: 0
//   });
  
//   // Loading states
//   const [loading, setLoading] = useState({
//     users: true,
//     orders: true,
//     products: true,
//     revenue: true
//   });

//   // Fetch users count
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const usersQuery = query(collection(db, 'users'));
//         const userSnapshot = await getDocs(usersQuery);
//         setMetrics(prev => ({ ...prev, users: userSnapshot.size }));
//       } catch (error) {
//         console.error('Error fetching users:', error);
//       } finally {
//         setLoading(prev => ({ ...prev, users: false }));
//       }
//     };

//     fetchUsers();

//     // Set up real-time listener for users collection
//     const unsubscribe = onSnapshot(
//       collection(db, 'users'),
//       (snapshot) => {
//         setMetrics(prev => ({ ...prev, users: snapshot.size }));
//         setLoading(prev => ({ ...prev, users: false }));
//       },
//       (error) => {
//         console.error('Error in users listener:', error);
//         setLoading(prev => ({ ...prev, users: false }));
//       }
//     );

//     return () => unsubscribe();
//   }, []);

//   // Fetch orders count and calculate revenue
//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const ordersQuery = query(collection(db, 'orders'));
//         const orderSnapshot = await getDocs(ordersQuery);
        
//         // Set orders count
//         setMetrics(prev => ({ ...prev, orders: orderSnapshot.size }));
        
//         // Calculate total revenue
//         let totalRevenue = 0;
//         orderSnapshot.forEach(doc => {
//           const orderData = doc.data();
//           if (orderData.totalAmount) {
//             totalRevenue += orderData.totalAmount;
//           }
//         });
        
//         setMetrics(prev => ({ ...prev, revenue: totalRevenue }));
//       } catch (error) {
//         console.error('Error fetching orders:', error);
//       } finally {
//         setLoading(prev => ({ ...prev, orders: false, revenue: false }));
//       }
//     };

//     fetchOrders();

//     // Set up real-time listener for orders collection
//     const unsubscribe = onSnapshot(
//       collection(db, 'orders'),
//       (snapshot) => {
//         // Update orders count
//         setMetrics(prev => ({ ...prev, orders: snapshot.size }));
        
//         // Recalculate total revenue
//         let totalRevenue = 0;
//         snapshot.forEach(doc => {
//           const orderData = doc.data();
//           if (orderData.totalAmount) {
//             totalRevenue += orderData.totalAmount;
//           }
//         });
        
//         setMetrics(prev => ({ ...prev, revenue: totalRevenue }));
//         setLoading(prev => ({ ...prev, orders: false, revenue: false }));
//       },
//       (error) => {
//         console.error('Error in orders listener:', error);
//         setLoading(prev => ({ ...prev, orders: false, revenue: false }));
//       }
//     );

//     return () => unsubscribe();
//   }, []);

//   // Fetch products count
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         // Count from categoryItems collection (or products if you have one)
//         const productsQuery = query(collection(db, 'categoryItems'));
//         const productSnapshot = await getDocs(productsQuery);
//         setMetrics(prev => ({ ...prev, products: productSnapshot.size }));
//       } catch (error) {
//         console.error('Error fetching products:', error);
//       } finally {
//         setLoading(prev => ({ ...prev, products: false }));
//       }
//     };

//     fetchProducts();

//     // Set up real-time listener for products collection
//     const unsubscribe = onSnapshot(
//       collection(db, 'categoryItems'), // Use your actual products collection
//       (snapshot) => {
//         setMetrics(prev => ({ ...prev, products: snapshot.size }));
//         setLoading(prev => ({ ...prev, products: false }));
//       },
//       (error) => {
//         console.error('Error in products listener:', error);
//         setLoading(prev => ({ ...prev, products: false }));
//       }
//     );

//     return () => unsubscribe();
//   }, []);

//   // Format currency (Indian Rupees)
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   return (
//     <div className="content">
//       <h1 className="page-title">Dashboard</h1>
      
//       <div className="dashboard-cards">
//         <div className="card stats-card">
//           <div className="stats-icon primary">
//             <i className="fas fa-users"></i>
//           </div>
//           <div className="stats-info">
//             {loading.users ? (
//               <div className="loading-spinner-small"></div>
//             ) : (
//               <h3>{metrics.users}</h3>
//             )}
//             <p>Total Users</p>
//           </div>
//         </div>
        
//         <div className="card stats-card">
//           <div className="stats-icon success">
//             <i className="fas fa-shopping-cart"></i>
//           </div>
//           <div className="stats-info">
//             {loading.orders ? (
//               <div className="loading-spinner-small"></div>
//             ) : (
//               <h3>{metrics.orders}</h3>
//             )}
//             <p>Orders</p>
//           </div>
//         </div>
//         <div className="card stats-card">
//           <div className="stats-icon info">
//             <i className="fas fa-rupee-sign"></i>
//           </div>
//           <div className="stats-info">
//             {loading.revenue ? (
//               <div className="loading-spinner-small"></div>
//             ) : (
//               <h3>{formatCurrency(metrics.revenue)}</h3>
//             )}
//             <p>Revenue</p>
//           </div>
//         </div>
//       </div>
      
//       <div className="management-buttons">
//         <button 
//           className="manage-btn btn-primary" 
//           onClick={() => setMode('items')}
//         >
//           <i className="fas fa-boxes mr-2"></i> Manage Items
//         </button>
//         <button 
//           className="manage-btn btn-success" 
//           onClick={() => setMode('orders')}
//         >
//           <i className="fas fa-shopping-cart mr-2"></i> Manage Orders
//         </button>
//         <button 
//           className="manage-btn btn-warning" 
//           onClick={() => setMode('designHouse')}
//         >
//           <i className="fas fa-microchip mr-2"></i> Manage Design House

//         </button>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;





import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  onSnapshot,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard({ setMode }) {
  const navigate = useNavigate();
  
  // State for dashboard metrics
  const [metrics, setMetrics] = useState({
    users: 0,
    orders: 0,
    products: 0,
    revenue: 0,
    hackathons: 0,
    featuredProducts: 0
  });
  
  // Loading states
  const [loading, setLoading] = useState({
    users: true,
    orders: true,
    products: true,
    revenue: true,
    hackathons: true,
    featuredProducts: true
  });

  // Fetch users count
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(collection(db, 'users'));
        const userSnapshot = await getDocs(usersQuery);
        setMetrics(prev => ({ ...prev, users: userSnapshot.size }));
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }
    };

    fetchUsers();

    // Set up real-time listener for users collection
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setMetrics(prev => ({ ...prev, users: snapshot.size }));
        setLoading(prev => ({ ...prev, users: false }));
      },
      (error) => {
        console.error('Error in users listener:', error);
        setLoading(prev => ({ ...prev, users: false }));
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch orders count and calculate revenue
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersQuery = query(collection(db, 'orders'));
        const orderSnapshot = await getDocs(ordersQuery);
        
        // Set orders count
        setMetrics(prev => ({ ...prev, orders: orderSnapshot.size }));
        
        // Calculate total revenue
        let totalRevenue = 0;
        orderSnapshot.forEach(doc => {
          const orderData = doc.data();
          if (orderData.totalAmount) {
            totalRevenue += orderData.totalAmount;
          }
        });
        
        setMetrics(prev => ({ ...prev, revenue: totalRevenue }));
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(prev => ({ ...prev, orders: false, revenue: false }));
      }
    };

    fetchOrders();

    // Set up real-time listener for orders collection
    const unsubscribe = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        // Update orders count
        setMetrics(prev => ({ ...prev, orders: snapshot.size }));
        
        // Recalculate total revenue
        let totalRevenue = 0;
        snapshot.forEach(doc => {
          const orderData = doc.data();
          if (orderData.totalAmount) {
            totalRevenue += orderData.totalAmount;
          }
        });
        
        setMetrics(prev => ({ ...prev, revenue: totalRevenue }));
        setLoading(prev => ({ ...prev, orders: false, revenue: false }));
      },
      (error) => {
        console.error('Error in orders listener:', error);
        setLoading(prev => ({ ...prev, orders: false, revenue: false }));
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch products count
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Count from categoryItems collection (or products if you have one)
        const productsQuery = query(collection(db, 'categoryItems'));
        const productSnapshot = await getDocs(productsQuery);
        setMetrics(prev => ({ ...prev, products: productSnapshot.size }));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };

    fetchProducts();

    // Set up real-time listener for products collection
    const unsubscribe = onSnapshot(
      collection(db, 'categoryItems'), // Use your actual products collection
      (snapshot) => {
        setMetrics(prev => ({ ...prev, products: snapshot.size }));
        setLoading(prev => ({ ...prev, products: false }));
      },
      (error) => {
        console.error('Error in products listener:', error);
        setLoading(prev => ({ ...prev, products: false }));
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch hackathons count
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const hackathonsQuery = query(collection(db, 'liveHackathons'));
        const hackathonsSnapshot = await getDocs(hackathonsQuery);
        setMetrics(prev => ({ ...prev, hackathons: hackathonsSnapshot.size }));
      } catch (error) {
        console.error('Error fetching hackathons:', error);
      } finally {
        setLoading(prev => ({ ...prev, hackathons: false }));
      }
    };

    fetchHackathons();

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      collection(db, 'liveHackathons'),
      (snapshot) => {
        setMetrics(prev => ({ ...prev, hackathons: snapshot.size }));
        setLoading(prev => ({ ...prev, hackathons: false }));
      },
      (error) => {
        console.error('Error in hackathons listener:', error);
        setLoading(prev => ({ ...prev, hackathons: false }));
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch featured products count
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const featuredQuery = query(
          collection(db, 'featuredProducts')
        );
        const featuredSnapshot = await getDocs(featuredQuery);
        setMetrics(prev => ({ ...prev, featuredProducts: featuredSnapshot.size }));
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(prev => ({ ...prev, featuredProducts: false }));
      }
    };

    fetchFeaturedProducts();

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      collection(db, 'featuredProducts'),
      (snapshot) => {
        setMetrics(prev => ({ ...prev, featuredProducts: snapshot.size }));
        setLoading(prev => ({ ...prev, featuredProducts: false }));
      },
      (error) => {
        console.error('Error in featured products listener:', error);
        setLoading(prev => ({ ...prev, featuredProducts: false }));
      }
    );

    return () => unsubscribe();
  }, []);

  // Format currency (Indian Rupees)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle mode changes and navigation
  const handleModeChange = (newMode, path = null) => {
    setMode(newMode);
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="content">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="dashboard-cards">
        <div className="card stats-card">
          <div className="stats-icon primary">
            <i className="fas fa-users"></i>
          </div>
          <div className="stats-info">
            {loading.users ? (
              <div className="loading-spinner-small"></div>
            ) : (
              <h3>{metrics.users}</h3>
            )}
            <p>Total Users</p>
          </div>
        </div>
        
        <div className="card stats-card">
          <div className="stats-icon success">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div className="stats-info">
            {loading.orders ? (
              <div className="loading-spinner-small"></div>
            ) : (
              <h3>{metrics.orders}</h3>
            )}
            <p>Orders</p>
          </div>
        </div>
        
        <div className="card stats-card">
          <div className="stats-icon info">
            <i className="fas fa-rupee-sign"></i>
          </div>
          <div className="stats-info">
            {loading.revenue ? (
              <div className="loading-spinner-small"></div>
            ) : (
              <h3>{formatCurrency(metrics.revenue)}</h3>
            )}
            <p>Revenue</p>
          </div>
        </div>
 
      </div>
      
      <div className="management-buttons">
        <button 
          className="manage-btn btn-primary" 
          onClick={() => handleModeChange('items', '/manage-items')}
        >
          <i className="fas fa-boxes mr-2"></i> Manage Items
        </button>
        <button 
          className="manage-btn btn-success" 
          onClick={() => handleModeChange('orders', '/orders')}
        >
          <i className="fas fa-shopping-cart mr-2"></i> Manage Orders
        </button>
        <button 
          className="manage-btn btn-warning" 
          onClick={() => handleModeChange('designHouse', '/model-banner')}
        >
          <i className="fas fa-microchip mr-2"></i> Manage Design House
        </button>
      </div>
    </div>
  );
}

export default Dashboard;