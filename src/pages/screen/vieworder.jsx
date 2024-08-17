import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './../../../firebase';

export function ViewOrder() {
  const [orderSummary, setOrderSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const date = searchParams.get('date');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const registrationsQuery = query(collection(db, 'registrations'), where('email', '==', email));
        const registrationsSnapshot = await getDocs(registrationsQuery);

        let registrationData = {};
        registrationsSnapshot.forEach(doc => {
          registrationData = doc.data();
        });

        const ordersQuery = query(
          collection(db, 'DOrders'),
          where('email', '==', email),
          where('date', '==', date)
        );
        const ordersSnapshot = await getDocs(ordersQuery);

        let combinedOrder = {
          email: registrationData.email,
          name: registrationData.name,
          phone: registrationData.phone,
          address: `${registrationData.district}, ${registrationData.state}`,
          products: [],
          totalAmount: 0,
          totalOrders: 0,
        };

        ordersSnapshot.forEach(doc => {
          const data = doc.data();
          data.items.forEach(item => {
            combinedOrder.products.push({
              productName: item.productName,
              price: item.price,
              quantity: item.quantity,
              totalAmount: item.totalAmount,
              date: data.date,
            });
            combinedOrder.totalAmount += item.totalAmount;
          });
          combinedOrder.totalOrders += 1;
        });

        setOrderSummary(combinedOrder);
      } catch (error) {
        console.error('Error fetching order details: ', error);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (email && date) {
      fetchOrderDetails();
    }
  }, [email, date]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-t-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!orderSummary || orderSummary.products.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-700">No orders found for this email and date.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold">
            Customer: {orderSummary.name} ({orderSummary.email})
          </h3>
          <p>
            <strong>Phone:</strong> {orderSummary.phone} | <strong>Address:</strong> {orderSummary.address}
          </p>
        </div>

        <div className="mb-6 text-center">
          <p>
            <strong>Date:</strong> {date} | <strong>Total Orders:</strong> {orderSummary.totalOrders} | <strong>Total Amount:</strong> ₹{orderSummary.totalAmount}
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-black">
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-white">PRODUCT</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-white">PRICE</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-white">QUANTITY</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-white">TOTAL AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {orderSummary.products.map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 border-b border-gray-300 text-sm text-gray-700">{product.productName}</td>
                  <td className="px-6 py-4 border-b border-gray-300 text-sm text-gray-700">₹{product.price}</td>
                  <td className="px-6 py-4 border-b border-gray-300 text-sm text-gray-700">{product.quantity}</td>
                  <td className="px-6 py-4 border-b border-gray-300 text-sm text-gray-700">₹{product.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden">
          {orderSummary.products.map((product, index) => (
            <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Product:</strong> {product.productName}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Price:</strong> ₹{product.price}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Quantity:</strong> {product.quantity}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Total Amount:</strong> ₹{product.totalAmount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ViewOrder;
