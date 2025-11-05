import React, { useEffect, useState, useMemo } from "react";
import Layout from "../components/Layout";
import Pagination from "../components/Pagination";
import { Filter, ArrowUpDown, ArrowUp, ArrowDown, Users, List } from "lucide-react";
import { getTimeLogs } from "../services/api";

const TimeLogs = () => {
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [groupByEmployee, setGroupByEmployee] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data } = await getTimeLogs();
        if (isMounted) setTimeLogs(data || []);
      } catch (e) {
        if (isMounted) setError("Failed to load time logs");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Get unique employees for filter dropdown
  const uniqueEmployees = useMemo(() => {
    const employees = new Map();
    timeLogs.forEach((log) => {
      const employeeId = log.employee?._id || log.employee?.id || log.employeeId || "unknown";
      const employeeName = log.employee?.name || log.employeeName || "N/A";
      const employeeEmail = log.employee?.email || "";
      if (!employees.has(employeeId)) {
        employees.set(employeeId, { id: employeeId, name: employeeName, email: employeeEmail });
      }
    });
    return Array.from(employees.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [timeLogs]);

  // Filter and sort time logs
  const filteredAndSortedTimeLogs = useMemo(() => {
    let filtered = [...timeLogs];

    // Apply employee filter
    if (employeeFilter !== "all") {
      filtered = filtered.filter((log) => {
        const employeeId = log.employee?._id || log.employee?.id || log.employeeId || "unknown";
        return employeeId === employeeFilter;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "employee":
          aValue = (a.employee?.name || a.employeeName || "").toLowerCase();
          bValue = (b.employee?.name || b.employeeName || "").toLowerCase();
          break;
        case "date":
          aValue = new Date(a.date || a.logDate || 0).getTime();
          bValue = new Date(b.date || b.logDate || 0).getTime();
          break;
        case "hours":
          aValue = a.hours || a.hoursLogged || 0;
          bValue = b.hours || b.hoursLogged || 0;
          break;
        case "created":
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        default:
          aValue = new Date(a.date || a.logDate || 0).getTime();
          bValue = new Date(b.date || b.logDate || 0).getTime();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [timeLogs, employeeFilter, sortField, sortDirection]);

  // Group by employee if enabled
  const groupedTimeLogs = useMemo(() => {
    if (!groupByEmployee) {
      return null;
    }

    const grouped = new Map();
    filteredAndSortedTimeLogs.forEach((log) => {
      const employeeId = log.employee?._id || log.employee?.id || log.employeeId || "unknown";
      const employeeName = log.employee?.name || log.employeeName || "N/A";
      const employeeEmail = log.employee?.email || "";

      if (!grouped.has(employeeId)) {
        grouped.set(employeeId, {
          employeeId,
          employeeName,
          employeeEmail,
          logs: [],
          totalHours: 0,
        });
      }

      const group = grouped.get(employeeId);
      const hours = log.hours || log.hoursLogged || 0;
      group.logs.push(log);
      group.totalHours += hours;
    });

    // Sort groups by employee name
    return Array.from(grouped.values()).sort((a, b) =>
      a.employeeName.localeCompare(b.employeeName)
    );
  }, [filteredAndSortedTimeLogs, groupByEmployee]);

  // Calculate pagination
  const displayItems = groupByEmployee
    ? groupedTimeLogs
    : filteredAndSortedTimeLogs;
  const totalItems = displayItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // For grouped view, we need to handle pagination differently
  const currentDisplayItems = groupByEmployee
    ? displayItems.slice(startIndex, endIndex)
    : displayItems.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleEmployeeFilterChange = (employeeId) => {
    setEmployeeFilter(employeeId);
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

  const toggleGroupByEmployee = () => {
    setGroupByEmployee(!groupByEmployee);
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Time Logs</h1>
          <p className="text-sm sm:text-base text-gray-600">Track employee working hours</p>
        </div>

        {/* Filter and Sort Controls */}
        <div className="mb-4 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Employee:</span>
            <select
              value={employeeFilter}
              onChange={(e) => handleEmployeeFilterChange(e.target.value)}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px] sm:min-w-[180px] flex-1 sm:flex-initial"
            >
              <option value="all">All Employees</option>
              {uniqueEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</span>
            <select
              value={sortField}
              onChange={(e) => handleSort(e.target.value)}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 sm:flex-initial min-w-[100px]"
            >
              <option value="date">Date</option>
              <option value="employee">Employee</option>
              <option value="hours">Hours</option>
              <option value="created">Created Date</option>
            </select>
            <button
              onClick={() => handleSort(sortField)}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center gap-1 whitespace-nowrap"
            >
              <span className="hidden sm:inline">{sortDirection === "asc" ? "Ascending" : "Descending"}</span>
              <span className="sm:hidden">{sortDirection === "asc" ? "Asc" : "Desc"}</span>
              {getSortIcon(sortField)}
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={toggleGroupByEmployee}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 w-full sm:w-auto justify-center ${
                groupByEmployee
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {groupByEmployee ? <List className="w-4 h-4" /> : <Users className="w-4 h-4" />}
              <span className="hidden sm:inline">{groupByEmployee ? "List View" : "Group by Employee"}</span>
              <span className="sm:hidden">{groupByEmployee ? "List" : "Group"}</span>
            </button>
          </div>

          <div className="w-full sm:w-auto sm:ml-auto text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            Showing <span className="font-semibold">{filteredAndSortedTimeLogs.length}</span> of{" "}
            <span className="font-semibold">{timeLogs.length}</span> time logs
            {groupByEmployee && (
              <span className="block sm:inline sm:ml-1 mt-1 sm:mt-0">
                • <span className="font-semibold">{groupedTimeLogs?.length || 0}</span> employees
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("employee")}
                  >
                    <div className="flex items-center">
                      Employee
                      {getSortIcon("employee")}
                    </div>
                  </th>
                  <th 
                    className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center">
                      Date
                      {getSortIcon("date")}
                    </div>
                  </th>
                  <th 
                    className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("hours")}
                  >
                    <div className="flex items-center">
                      Hours
                      {getSortIcon("hours")}
                    </div>
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th 
                    className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("created")}
                  >
                    <div className="flex items-center">
                      Created
                      {getSortIcon("created")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr><td className="px-4 lg:px-6 py-4" colSpan={5}>Loading...</td></tr>
                )}
                {error && !loading && (
                  <tr><td className="px-4 lg:px-6 py-4 text-red-600" colSpan={5}>{error}</td></tr>
                )}
                {!loading && !error && filteredAndSortedTimeLogs.length === 0 && (
                  <tr><td className="px-4 lg:px-6 py-4 text-gray-500 text-center" colSpan={5}>No time logs found matching the selected filter</td></tr>
                )}
                {!loading && !error && !groupByEmployee && currentDisplayItems.map((log) => {
                  const id = log._id || log.id || log.logID;
                  
                  // Get employee name from populated employee object
                  const employeeName = log.employee?.name || log.employeeName || "N/A";
                  const employeeEmail = log.employee?.email || "";
                  
                  // Format date
                  let formattedDate = "N/A";
                  const logDate = log.date || log.logDate;
                  if (logDate) {
                    try {
                      const date = new Date(logDate);
                      formattedDate = date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      });
                    } catch (e) {
                      formattedDate = String(logDate).slice(0, 10);
                    }
                  }
                  
                  // Get hours
                  const hours = log.hours || log.hoursLogged || 0;
                  const hoursDisplay = `${hours.toFixed(1)}h`;
                  
                  // Get description
                  const description = log.description || log.notes || "-";
                  
                  // Format created date
                  let createdDate = "N/A";
                  if (log.createdAt) {
                    try {
                      const date = new Date(log.createdAt);
                      createdDate = date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      });
                    } catch (e) {
                      createdDate = String(log.createdAt).slice(0, 10);
                    }
                  }
                  
                  return (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employeeName}</div>
                        {employeeEmail && (
                          <div className="text-xs text-gray-500">{employeeEmail}</div>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formattedDate}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">{hoursDisplay}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{description}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{createdDate}</td>
                    </tr>
                  );
                })}
                {!loading && !error && groupByEmployee && currentDisplayItems.map((group) => {
                  return (
                    <React.Fragment key={group.employeeId}>
                      {/* Employee Group Header */}
                      <tr className="bg-blue-50 border-t-2 border-blue-200">
                        <td colSpan={5} className="px-4 lg:px-6 py-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <div className="text-sm font-semibold text-blue-900">{group.employeeName}</div>
                              {group.employeeEmail && (
                                <div className="text-xs text-blue-700">{group.employeeEmail}</div>
                              )}
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-blue-900">
                              Total: {group.totalHours.toFixed(1)}h ({group.logs.length} {group.logs.length === 1 ? "log" : "logs"})
                            </div>
                          </div>
                        </td>
                      </tr>
                      {/* Employee Logs */}
                      {group.logs.map((log) => {
                        const id = log._id || log.id || log.logID;
                        
                        // Format date
                        let formattedDate = "N/A";
                        const logDate = log.date || log.logDate;
                        if (logDate) {
                          try {
                            const date = new Date(logDate);
                            formattedDate = date.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            });
                          } catch (e) {
                            formattedDate = String(logDate).slice(0, 10);
                          }
                        }
                        
                        // Get hours
                        const hours = log.hours || log.hoursLogged || 0;
                        const hoursDisplay = `${hours.toFixed(1)}h`;
                        
                        // Get description
                        const description = log.description || log.notes || "-";
                        
                        // Format created date
                        let createdDate = "N/A";
                        if (log.createdAt) {
                          try {
                            const date = new Date(log.createdAt);
                            createdDate = date.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            });
                          } catch (e) {
                            createdDate = String(log.createdAt).slice(0, 10);
                          }
                        }
                        
                        return (
                          <tr key={id} className="hover:bg-gray-50 bg-gray-50/50">
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap pl-8 sm:pl-12">
                              <div className="text-sm text-gray-600">-</div>
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formattedDate}</td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">{hoursDisplay}</td>
                            <td className="px-4 lg:px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{description}</td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{createdDate}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {loading && (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            )}
            {error && !loading && (
              <div className="p-4 text-center text-red-600">{error}</div>
            )}
            {!loading && !error && filteredAndSortedTimeLogs.length === 0 && (
              <div className="p-4 text-center text-gray-500">No time logs found matching the selected filter</div>
            )}
            {!loading && !error && !groupByEmployee && currentDisplayItems.map((log) => {
              const id = log._id || log.id || log.logID;
              const employeeName = log.employee?.name || log.employeeName || "N/A";
              const employeeEmail = log.employee?.email || "";
              
              let formattedDate = "N/A";
              const logDate = log.date || log.logDate;
              if (logDate) {
                try {
                  const date = new Date(logDate);
                  formattedDate = date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  });
                } catch (e) {
                  formattedDate = String(logDate).slice(0, 10);
                }
              }
              
              const hours = log.hours || log.hoursLogged || 0;
              const hoursDisplay = `${hours.toFixed(1)}h`;
              const description = log.description || log.notes || "-";
              
              let createdDate = "N/A";
              if (log.createdAt) {
                try {
                  const date = new Date(log.createdAt);
                  createdDate = date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  });
                } catch (e) {
                  createdDate = String(log.createdAt).slice(0, 10);
                }
              }
              
              return (
                <div key={id} className="border-b border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{employeeName}</div>
                      {employeeEmail && (
                        <div className="text-xs text-gray-500">{employeeEmail}</div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-blue-600">{hoursDisplay}</div>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div><span className="font-medium">Date:</span> {formattedDate}</div>
                    <div><span className="font-medium">Description:</span> {description}</div>
                    <div><span className="font-medium">Created:</span> {createdDate}</div>
                  </div>
                </div>
              );
            })}
            {!loading && !error && groupByEmployee && currentDisplayItems.map((group) => {
              return (
                <div key={group.employeeId} className="border-b-2 border-blue-200">
                  {/* Employee Group Header */}
                  <div className="bg-blue-50 p-3">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-semibold text-blue-900">{group.employeeName}</div>
                      {group.employeeEmail && (
                        <div className="text-xs text-blue-700">{group.employeeEmail}</div>
                      )}
                      <div className="text-xs font-bold text-blue-900 mt-1">
                        Total: {group.totalHours.toFixed(1)}h ({group.logs.length} {group.logs.length === 1 ? "log" : "logs"})
                      </div>
                    </div>
                  </div>
                  {/* Employee Logs */}
                  {group.logs.map((log) => {
                    const id = log._id || log.id || log.logID;
                    
                    let formattedDate = "N/A";
                    const logDate = log.date || log.logDate;
                    if (logDate) {
                      try {
                        const date = new Date(logDate);
                        formattedDate = date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        });
                      } catch (e) {
                        formattedDate = String(logDate).slice(0, 10);
                      }
                    }
                    
                    const hours = log.hours || log.hoursLogged || 0;
                    const hoursDisplay = `${hours.toFixed(1)}h`;
                    const description = log.description || log.notes || "-";
                    
                    let createdDate = "N/A";
                    if (log.createdAt) {
                      try {
                        const date = new Date(log.createdAt);
                        createdDate = date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        });
                      } catch (e) {
                        createdDate = String(log.createdAt).slice(0, 10);
                      }
                    }
                    
                    return (
                      <div key={id} className="border-b border-gray-200 bg-gray-50/50 p-3 pl-6">
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-xs text-gray-600">-</div>
                          <div className="text-xs font-bold text-blue-600">{hoursDisplay}</div>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div><span className="font-medium">Date:</span> {formattedDate}</div>
                          <div><span className="font-medium">Description:</span> {description}</div>
                          <div><span className="font-medium">Created:</span> {createdDate}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          {!loading && !error && filteredAndSortedTimeLogs.length > 0 && (
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

export default TimeLogs;

