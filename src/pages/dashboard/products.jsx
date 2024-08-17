import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './../../../firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/solid';
import EditProductModal from './EditProductModal';

export function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDeleteClick = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        setProducts(prevProducts =>
          prevProducts.filter(product => product.id !== productId)
        );
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productList);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {loading ? (
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center hidden md:block">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill().map((_, index) => (
              <div key={index} className="bg-white animate-pulse shadow-lg rounded-lg overflow-hidden h-64"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="container mx-auto">
         <h2 className="text-2xl font-bold mb-6 text-center hidden md:block">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div
                key={product.id}
                className="bg-white shadow-lg rounded-lg overflow-hidden"
              >
                <img
                  src={product.imageUrl}
                  alt={product.productName}
                  className="w-full h-48"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-semibold capitalize mb-2">{product.productName}</h3>
                  <p className="text-gray-800 mb-2"><strong>Price:</strong> ₹{Number(product.price).toFixed(2)}</p>
                  <p className="text-gray-800 mb-4"><strong>Quantity:</strong> {product.quantity}</p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-black-500 hover:text-blue-700 flex items-center"
                    >
                      <PencilIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product.id)}
                      className="text-red-500 hover:text-red-700 flex items-center"
                    >
                      <TrashIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedProduct && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          product={selectedProduct}
          onSave={handleSave}
        />
      )}

      <button
        onClick={() => navigate('/screen/addnewproduct')}
        className="fixed bottom-4 right-4 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 flex items-center justify-center space-x-2"
      >
        <PlusIcon className="w-6 h-6" />
        <span className="text-lg font-semibold">Add New</span>
      </button>
    </div>
  );
}

export default Products;
