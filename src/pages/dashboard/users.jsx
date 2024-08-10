import React, { useEffect, useState } from 'react';
import { db } from './../../../firebase';
import { collection, getDocs } from 'firebase/firestore';

export function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'registrations');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => doc.data());
      setUsers(userList);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto relative">
      {loading ? (
        <div className="absolute top-20 inset-0 flex items-center justify-center bg-gray-50">
          <div className="animate-spin h-8 w-8 border-4 border-t-4 border-blue-500 rounded-full"></div>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6 text-center">Registered Users</h2>
          <div className="overflow-x-auto sm:rounded-lg">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-200 bg-black text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 bg-black text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 bg-black text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 bg-black text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 bg-black text-left text-xs font-semibold text-white uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 bg-black text-left text-xs font-semibold text-white uppercase tracking-wider">
                    District
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 bg-black text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 bg-black text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Password
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.state}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.district}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.userType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.password}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Users;
