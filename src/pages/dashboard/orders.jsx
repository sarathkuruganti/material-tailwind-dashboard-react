import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from './../../../firebase';

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const registrationsSnapshot = await getDocs(collection(db, 'registrations'));
        const ordersSnapshot = await getDocs(collection(db, 'DOrders'));

        const registrationsData = registrationsSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data();
          if (data.email) {
            acc[data.email] = {
              name: data.name,
              phone: data.phone,
              Type: data.userType,
              source: 'registrations'
            };
          }
          return acc;
        }, {});

        const ordersData = ordersSnapshot.docs.map(doc => {
          const orderItems = doc.data().items;
          const email = doc.data().email;
          const date = doc.data().date;
          
          const combinedProductName = orderItems.map(item => item.productName).join(', ');
          const combinedTotalAmount = orderItems.reduce((sum, item) => sum + item.totalAmount, 0);

          return {
            id: doc.id,
            productName: combinedProductName,
            totalAmount: combinedTotalAmount,
            email,
            date,
            source: 'DOrders'
          };
        });

        const combinedData = ordersData.reduce((acc, order) => {
          const registration = registrationsData[order.email];
          const existingOrder = acc.find(o => o.email === order.email && o.date === order.date);

          if (existingOrder) {
            existingOrder.productName += `, ${order.productName}`;
            existingOrder.totalAmount += order.totalAmount;
          } else {
            acc.push({ ...order, ...registration });
          }

          return acc;
        }, []);

        const allColumns = new Set();
        combinedData.forEach(order => {
          Object.keys(order).forEach(key => {
            if (key !== 'id' && key !== 'source') {
              allColumns.add(key);
            }
          });
        });

        setColumns([...allColumns]);
        setOrders(combinedData);
      } catch (error) {
        console.error('Error fetching orders: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleRowClick = (email, date) => {
    navigate(`/screen/vieworder?email=${email}&date=${date}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-t-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h2 className="text-xl font-bold text-gray-700">No orders available</h2>
      </div>
    );
  }

  // Mapping column names to user-friendly headers
  const getColumnName = (column) => {
    switch (column) {
      case 'productName':
        return 'Product Name';
      case 'totalAmount':
        return 'Total Amount';
      case 'email':
        return 'Email';
      case 'date':
        return 'Date';
      case 'name':
        return 'Name';
      case 'phone':
        return 'Phone';
      case 'Type':
        return 'Type';
      default:
        return column;
    }
  };

  return (
    <div className="relative">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center hidden md:block">Orders</h2>
        <div className="hidden sm:block overflow-x-auto shadow-md sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-black">
              <tr>
                {columns.map(column => (
                  <th
                    key={column}
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    {getColumnName(column)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(order => (
                <tr 
                  key={`${order.email}-${order.date}`} 
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleRowClick(order.email, order.date)}
                >
                  {columns.map(column => (
                    <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order[column] || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="block sm:hidden">
          {orders.map(order => (
            <div 
              key={`${order.email}-${order.date}`} 
              className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 cursor-pointer border border-gray-200"
              onClick={() => handleRowClick(order.email, order.date)}
            >
              <div className="p-4">
                <div className="text-lg font-semibold mb-2">Order on {new Date(order.date).toLocaleDateString()}</div>
                <div className="text-sm text-gray-600 mb-4">Email: {order.email}</div>
                
                {columns.map(column => (
                  <div key={column} className="flex justify-between mb-2 border-b border-gray-200 pb-2">
                    <span className="font-medium text-gray-900 capitalize">{getColumnName(column)}:</span>
                    <span className="text-gray-800 text-left flex-1">{order[column] || 'N/A'}</span>
                  </div>
                ))}
                
                <button 
                  className="w-full bg-blue-500 text-white py-2 rounded-md mt-4 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={() => handleRowClick(order.email, order.date)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Orders;
