import React, { useEffect, useState, useMemo } from "react";
import Layout from "../components/Layout";
import Pagination from "../components/Pagination";
import { Trash2, Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { getUsers, deleteUser } from "../services/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data } = await getUsers();
        if (isMounted) setUsers(data || []);
      } catch (err) {
        if (isMounted) setError("Failed to load users");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users];

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => {
        const userRole = (user.role || "").toLowerCase();
        if (roleFilter === "employee" || roleFilter === "employees") {
          return userRole === "employee" || userRole === "employees";
        } else if (roleFilter === "customer" || roleFilter === "customers") {
          return userRole === "customer" || userRole === "customers";
        } else if (roleFilter === "admin") {
          return userRole === "admin" || userRole === "administrator";
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "name":
          aValue = (a.name || a.fullName || "").toLowerCase();
          bValue = (b.name || b.fullName || "").toLowerCase();
          break;
        case "email":
          aValue = (a.email || "").toLowerCase();
          bValue = (b.email || "").toLowerCase();
          break;
        case "role":
          aValue = (a.role || "").toLowerCase();
          bValue = (b.role || "").toLowerCase();
          break;
        case "phone":
          aValue = (a.phoneNumber || "").toLowerCase();
          bValue = (b.phoneNumber || "").toLowerCase();
          break;
        default:
          aValue = (a.name || a.fullName || "").toLowerCase();
          bValue = (b.name || b.fullName || "").toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, roleFilter, sortField, sortDirection]);

  // Calculate pagination
  const totalItems = filteredAndSortedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      const updatedUsers = users.filter((u) => (u._id || u.id) !== id);
      setUsers(updatedUsers);
      
      // Reset to first page if current page becomes empty
      // Calculate remaining items after filter
      let remainingItems = updatedUsers.length;
      if (roleFilter !== "all") {
        remainingItems = updatedUsers.filter((user) => {
          const userRole = (user.role || "").toLowerCase();
          if (roleFilter === "employee" || roleFilter === "employees") {
            return userRole === "employee" || userRole === "employees";
          } else if (roleFilter === "customer" || roleFilter === "customers") {
            return userRole === "customer" || userRole === "customers";
          } else if (roleFilter === "admin") {
            return userRole === "admin" || userRole === "administrator";
          }
          return true;
        }).length;
      }
      
      const maxPage = Math.ceil(remainingItems / itemsPerPage);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      } else if (maxPage === 0) {
        setCurrentPage(1);
      }
    } catch (e) {
      alert("Failed to delete user");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (role) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 text-blue-600" />
    );
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Users Management</h1>
          <p className="text-gray-600">Manage customers and employees</p>
        </div>

        {/* Filter and Sort Controls */}
        <div className="mb-4 flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter by Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => handleRoleFilterChange(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="customer">Customers</option>
              <option value="employee">Employees</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortField}
              onChange={(e) => handleSort(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
              <option value="phone">Phone</option>
            </select>
            <button
              onClick={() => handleSort(sortField)}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center"
            >
              {sortDirection === "asc" ? "Ascending" : "Descending"}
              {getSortIcon(sortField)}
            </button>
          </div>

          <div className="ml-auto text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredAndSortedUsers.length}</span> of{" "}
            <span className="font-semibold">{users.length}</span> users
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Name
                      {getSortIcon("name")}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      Email
                      {getSortIcon("email")}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("phone")}
                  >
                    <div className="flex items-center">
                      Phone Number
                      {getSortIcon("phone")}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center">
                      Role
                      {getSortIcon("role")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr><td className="px-6 py-4" colSpan={6}>Loading...</td></tr>
                )}
                {error && !loading && (
                  <tr><td className="px-6 py-4 text-red-600" colSpan={6}>{error}</td></tr>
                )}
                {!loading && !error && filteredAndSortedUsers.length === 0 && (
                  <tr><td className="px-6 py-4 text-gray-500 text-center" colSpan={6}>No users found matching the selected filter</td></tr>
                )}
                {!loading && !error && currentUsers.map((user) => {
                  const id = user._id || user.id;
                  return (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.name || user.fullName || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.phoneNumber || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "customer" || user.role === "Customer" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && !error && filteredAndSortedUsers.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Users;
