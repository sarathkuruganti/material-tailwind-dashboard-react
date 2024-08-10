import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { db } from './../../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const EditProductModal = ({ isOpen, onClose, product, onSave }) => {
  const [productName, setProductName] = useState(product.productName || '');
  const [price, setPrice] = useState(product.price || '');
  const [quantity, setQuantity] = useState(product.quantity || '');

  const handleSave = async () => {
    try {
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, {
        productName,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
      });
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
          <Dialog.Title className="text-xl font-semibold mb-4">Edit Product</Dialog.Title>
          <div>
            <label className="block mb-2 text-gray-700">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mt-4">
            <label className="block mb-2 text-gray-700">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mt-4">
            <label className="block mb-2 text-gray-700">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default EditProductModal;
