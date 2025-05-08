import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Loader2, Plus, Trash2, Edit } from 'lucide-react';
import api from '../../utils/api';
import CategoryForm from './CategoryForm';

interface Category {
  id: number;
  name: string;
}

const CategoriesView: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/categories/');
      console.log('API categories response:', response.data);
  
      // Ensure we are accessing the correct property, which is 'results' in the API response
      let categoriesData: Category[] = [];
  
      if (Array.isArray(response.data.results)) {
        categoriesData = response.data.results; // Get the categories from the 'results' key
      } else {
        console.warn('Unexpected categories data format');
      }
  
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]); // Fallback to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this category?');
    if (!confirmed) return;

    try {
      await api.delete(`/categories/${id}/`);
      toast.success('Category deleted successfully');
      fetchCategories(); // Refresh the categories list
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setCurrentCategory(null);
    fetchCategories(); // Refresh after form submission
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setCurrentCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <button
            onClick={() => {
              setCurrentCategory(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-500">Loading categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No categories found.</p>
            <p className="mt-1 text-sm text-gray-400">
              Click the &quot;Add Category&quot; button to create your first category.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-700">{category.name}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
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

      {isFormOpen && (
        <CategoryForm
          category={currentCategory}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default CategoriesView;
