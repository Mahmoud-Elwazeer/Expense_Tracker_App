import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Loader2, Plus, Filter, Calendar, Trash2, Edit, RefreshCcw } from 'lucide-react';
import api from '../../utils/api';
import ExpenseForm from './ExpenseForm';
import FilterPanel from './FilterPanel';

// Updated interface to handle potential different category formats
interface Expense {
  id: number;
  amount: number;
  category: string | { id: number; name: string }; // Handle both string and object formats
  description: string;
  date: string;
}

const ExpensesView: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterParams, setFilterParams] = useState({
    category: '',
    start_date: '',
    end_date: '',
  });
  const [monthlyReport, setMonthlyReport] = useState<{ total_expenses: number } | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    // Small delay to ensure authentication is properly set up
    const timer = setTimeout(() => {
      fetchExpenses();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [filterParams]);

  const fetchExpenses = async () => {
    setIsLoading(true);
    setFetchError(null);
    
    try {
      // Build query string from filter params
      const queryParams = new URLSearchParams();
      if (filterParams.category) queryParams.append('category', filterParams.category);
      if (filterParams.start_date) queryParams.append('start_date', filterParams.start_date);
      if (filterParams.end_date) queryParams.append('end_date', filterParams.end_date);
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await api.get(`/expenses/${query}`);
      
      // Make sure response.data exists and is an array
      if (Array.isArray(response.data)) {
        setExpenses(response.data);
      } else if (response.data && typeof response.data === 'object') {
        // Handle case where response might be wrapped in a data property
        setExpenses(Array.isArray(response.data.results) ? response.data.results : []);
      } else {
        console.error('Unexpected response format:', response.data);
        setExpenses([]);
        setFetchError('Received unexpected data format from server');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setFetchError('Failed to load expenses. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to safely get category name regardless of format
  const getCategoryName = (category: string | { id: number; name: string }): string => {
    if (typeof category === 'string') {
      return category;
    }
    return category?.name || 'Unknown';
  };

  // Helper function to safely format date
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Invalid date format:', dateString, error);
      return 'Invalid date';
    }
  };

  // Helper function to safely format amount
  const formatAmount = (amount: number): string => {
    try {
      return amount.toFixed(2);
    } catch (error) {
      console.error('Invalid amount format:', amount, error);
      return 'N/A';
    }
  };

  const handleEdit = (expense: Expense) => {
    setCurrentExpense(expense);
    setIsEditFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await api.delete(`/expenses/${id}/`);
      toast.success('Expense deleted successfully');
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense. Please try again.');
    }
  };

  const handleFormSubmit = () => {
    setIsAddFormOpen(false);
    setIsEditFormOpen(false);
    setCurrentExpense(null);
    fetchExpenses();
  };

  const handleFormCancel = () => {
    setIsAddFormOpen(false);
    setIsEditFormOpen(false);
    setCurrentExpense(null);
  };

  const handleFilterSubmit = (filters: typeof filterParams) => {
    setFilterParams(filters);
    setIsFilterOpen(false);
  };

  const fetchMonthlyReport = async () => {
    setIsReportLoading(true);
    try {
      const response = await api.get('/expenses/monthly_report/');
      
      if (response.data && typeof response.data.total_expenses === 'number') {
        setMonthlyReport(response.data);
        toast.success('Monthly report loaded');
      } else {
        console.error('Unexpected monthly report format:', response.data);
        toast.error('Could not load monthly report due to data format issues');
      }
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      toast.error('Failed to load monthly report. Please try again.');
    } finally {
      setIsReportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
          
          <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </button>
            
            <button
              onClick={fetchMonthlyReport}
              className={`inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 ${
                isReportLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              disabled={isReportLoading}
            >
              {isReportLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="mr-2 h-4 w-4" />
              )}
              Monthly Report
            </button>
            
            <button
              onClick={() => setIsAddFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </button>
          </div>
        </div>

        {fetchError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{fetchError}</p>
            <button 
              onClick={fetchExpenses}
              className="mt-2 text-sm text-red-600 hover:text-red-800 flex items-center"
            >
              <RefreshCcw className="mr-1 h-4 w-4" /> Try again
            </button>
          </div>
        )}

        {monthlyReport && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold text-blue-800">Monthly Report</h2>
            <p className="mt-1 text-blue-600">
              Total expenses this month: <span className="font-bold">${formatAmount(monthlyReport.total_expenses)}</span>
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-500">Loading expenses...</span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No expenses found.</p>
            <p className="mt-1 text-sm text-gray-400">
              {Object.values(filterParams).some(Boolean)
                ? 'Try changing the filters or clear them.'
                : 'Click the "Add Expense" button to create your first expense.'}
            </p>
            {Object.values(filterParams).some(Boolean) && (
              <button
                onClick={() => {
                  setFilterParams({ category: '', start_date: '', end_date: '' });
                }}
                className="mt-4 inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                <RefreshCcw className="mr-1 h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {getCategoryName(expense.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {expense.description || 'No description'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${formatAmount(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Expense Modal */}
      {(isAddFormOpen || isEditFormOpen) && (
        <ExpenseForm
          expense={currentExpense}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* Filter Panel */}
      {isFilterOpen && (
        <FilterPanel
          initialFilters={filterParams}
          onSubmit={handleFilterSubmit}
          onCancel={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
};

export default ExpensesView;