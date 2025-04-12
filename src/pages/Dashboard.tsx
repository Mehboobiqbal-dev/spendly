import React, { useState, useEffect, useMemo } from 'react';
import {
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  doc,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useExpenses, Expense } from '../hooks/useExpenses';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Doughnut, Bar, Line } from 'react-chartjs-2';
import { Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMoneyBillWave, FaList, FaChartLine } from 'react-icons/fa6';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { expenses, loading, error } = useExpenses();

  // State declarations
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [notification, setNotification] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [chartType, setChartType] = useState<'pie' | 'doughnut' | 'bar' | 'line'>('pie');

  // Filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((expense) => {
        const d = expense.date;
        const okCat = filterCategory ? expense.category === filterCategory : true;
        const okStart = filterStartDate ? d >= new Date(filterStartDate) : true;
        const okEnd = filterEndDate ? d <= new Date(filterEndDate) : true;
        const okSearch = searchQuery
          ? expense.note?.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        return okCat && okStart && okEnd && okSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.getTime() - a.date.getTime();
        if (sortBy === 'date_asc') return a.date.getTime() - b.date.getTime();
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [expenses, filterCategory, filterStartDate, filterEndDate, searchQuery, sortBy]);

  // Debug logging
  useEffect(() => {
    console.log({ user, expenses, filteredExpenses });
  }, [user, expenses, filteredExpenses]);

  // Category totals for chart
  const categoryTotals = useMemo(() => {
    const t: Record<string, number> = {};
    expenses.forEach((e) => {
      t[e.category] = (t[e.category] || 0) + e.amount;
    });
    return t;
  }, [expenses]);

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: 'Amount',
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#8A2BE2',
          '#00FA9A',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const },
      tooltip: { enabled: true },
    },
  };

  const renderChart = () => {
    if (expenses.length === 0) {
      return <p className="text-black">No data to display.</p>;
    }
    switch (chartType) {
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} />;
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      default:
        return null;
    }
  };

  // Summary statistics
  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const highestExpense = expenses.length > 0 ? Math.max(...expenses.map((e) => e.amount)) : 0;

  // Handlers
  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setNotification('Not authenticated.');
    if (!amount || !category || !date) return setNotification('Fill all required fields.');

    const amt = parseFloat(amount);
    if (isNaN(amt)) return setNotification('Invalid amount.');
    const d = new Date(date);
    if (isNaN(d.getTime())) return setNotification('Invalid date.');

    const data = {
      userId: user.uid,
      amount: amt,
      category,
      date: Timestamp.fromDate(d),
      note: note.trim(),
    };

    try {
      if (editingExpense) {
        await updateDoc(doc(db, 'expenses', editingExpense.id), data);
        setNotification('Expense updated!');
        setEditingExpense(null);
      } else {
        await addDoc(collection(db, 'expenses'), data);
        setNotification('Expense added!');
      }
      setAmount('');
      setCategory('');
      setDate('');
      setNote('');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      console.error(err);
      setNotification('Error processing expense.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
      setNotification('Expense deleted!');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      console.error(err);
      setNotification('Error deleting expense.');
    }
  };

  const handleEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setAmount(exp.amount.toString());
    setCategory(exp.category);
    setDate(exp.date.toISOString().split('T')[0]);
    setNote(exp.note || '');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  // Loading and error states
  if (loading) return <div className="text-center p-4 text-black">Loading...</div>;
  if (error) {
    return (
      <div className="text-center p-4 text-black">
        Error: {error} <br />
        Check console or Firestore setup.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 text-black [&_*]:text-black">
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-lg shadow-lg mb-8"
        whileHover={{ rotateX: 2, rotateY: 2 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <motion.button
            onClick={handleLogout}
            style={{ color: 'black' }}
            className="py-2 px-4 bg-black text-black font-semibold rounded-lg"
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            Logout
          </motion.button>
        </div>
      </motion.div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-6 p-3 bg-green-100 border border-green-300 rounded-lg shadow-md"
            transition={{ duration: 0.3 }}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Form */}
      <motion.div
        className="bg-white shadow-lg rounded-lg p-6 mb-8"
        whileHover={{ rotateX: 1, rotateY: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <h3 className="text-xl font-semibold mb-4">
          {editingExpense ? 'Edit Expense' : 'Add Expense'}
        </h3>
        <form onSubmit={handleAddOrUpdate} className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1">
              <label htmlFor="amount" className="block mb-1 font-medium">Amount*</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="category" className="block mb-1 font-medium">Category*</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Select Category</option>
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Shopping">Shopping</option>
                <option value="Bills">Bills</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1">
              <label htmlFor="expenseDate" className="block mb-1 font-medium">Expense Date*</label>
              <input
                id="expenseDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="note" className="block mb-1 font-medium">Note (optional)</label>
              <input
                id="note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note"
                className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
          <motion.button
            type="submit"
            className="bg-black text-white p-2 rounded-lg"
            whileHover={{ scale: 1.05, rotateX: 2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {editingExpense ? 'Update Expense' : 'Add Expense'}
          </motion.button>
        </form>
      </motion.div>

      {/* Filters & Sorting */}
      <motion.div
        className="bg-white shadow-lg rounded-lg p-6 mb-8"
        whileHover={{ rotateX: 1, rotateY: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <h3 className="text-xl font-semibold mb-4">Filters & Sorting</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-300"
          >
            <option value="">All Categories</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Entertainment">Entertainment</option>
          </select>
          <div>
            <label htmlFor="startDate" className="block mb-1 font-medium">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block mb-1 font-medium">End Date</label>
            <input
              id="endDate"
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-300"
            placeholder="Search Note"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-300"
          >
            <option value="date_desc">Latest Date</option>
            <option value="date_asc">Oldest Date</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>
        <motion.button
          onClick={() => {
            setFilterCategory('');
            setFilterStartDate('');
            setFilterEndDate('');
            setSearchQuery('');
          }}
          className="mt-4 bg-gray-500 text-white p-2 rounded-lg"
          whileHover={{ scale: 1.05, rotateX: 2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          Reset Filters
        </motion.button>
      </motion.div>

      {/* Expenses List */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Expenses ({filteredExpenses.length})</h3>
        {filteredExpenses.length === 0 ? (
          <p>No expenses found. Try resetting filters or adding new expenses.</p>
        ) : (
          <ul className="space-y-4">
            <AnimatePresence>
              {filteredExpenses.map((expense) => (
                <motion.li
                  key={expense.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.02, rotateX: 3, rotateY: 3 }}
                  className="p-4 border rounded-lg shadow-md bg-gray-50"
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <p className="font-medium">
                        {expense.date.toLocaleDateString()} - {expense.category}
                      </p>
                      <p>
                        ${expense.amount.toFixed(2)}{' '}
                        {expense.note && <span className="text-gray-600"> - {expense.note}</span>}
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0 flex space-x-4">
                      <motion.button
                        onClick={() => handleEdit(expense)}
                        className="text-blue-500 hover:underline"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-500 hover:underline"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            className="p-4 bg-blue-100 border rounded-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, rotateX: 2 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <FaMoneyBillWave className="text-3xl mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
            <p>Total Amount</p>
          </motion.div>
          <motion.div
            className="p-4 bg-green-100 border rounded-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, rotateX: 2 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
          >
            <FaList className="text-3xl mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{totalExpenses}</p>
            <p>Number of Expenses</p>
          </motion.div>
          <motion.div
            className="p-4 bg-red-100 border rounded-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, rotateX: 2 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
          >
            <FaChartLine className="text-3xl mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">${highestExpense.toFixed(2)}</p>
            <p>Highest Expense</p>
          </motion.div>
        </div>
      </div>

      {/* Category Breakdown */}
      <motion.div
        className="bg-white shadow-lg rounded-lg p-6"
        whileHover={{ rotateX: 1, rotateY: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <h3 className="text-xl font-semibold mb-4">Category Breakdown</h3>
        <div className="mb-4 flex items-center space-x-2">
          <label htmlFor="chartType" className="font-medium">Chart Type:</label>
          <motion.select
            id="chartType"
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-300"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <option value="pie">Pie</option>
            <option value="doughnut">Doughnut</option>
            <option value="bar">Bar</option>
            <option value="line">Line</option>
          </motion.select>
        </div>
        <div className="w-full md:w-2/3 mx-auto">{renderChart()}</div>
      </motion.div>
    </div>
  );
};

export default Dashboard;