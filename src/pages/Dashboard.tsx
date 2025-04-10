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

  useEffect(() => {
    console.log({ user, expenses, filteredExpenses });
  }, [user, expenses, filteredExpenses]);

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
        return <Doughnut data={chartData} className="text-black" options={chartOptions} />;
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      default:
        return null;
    }
  };

  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const highestExpense =
    expenses.length > 0
      ? Math.max(...expenses.map((e) => e.amount))
      : 0;

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

  if (loading) return <div className="text-center p-4 text-black">Loading...</div>;
  if (error)
    return (
      <div className="text-center p-4 text-black">
        Error: {error} <br />
        Check console or Firestore setup.
      </div>
    );

  return (
    <div className="container mx-auto p-4 text-black [&_*]:text-black">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl text-black font-bold">Dashboard</h2>
        <button
          onClick={handleLogout}
          style={{ color: 'black' }}
  className="py-3 bg-black font-semibold rounded-lg hover:bg-gray-800 transition"
>
          Logout
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
          {notification}
        </div>
      )}

      {/* Add/Edit Form */}
      <div className="bg-white shadow rounded p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">
          {editingExpense ? 'Edit Expense' : 'Add Expense'}
        </h3>
        <form onSubmit={handleAddOrUpdate} className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:space-x-4">
            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              pattern="\d+(\.\d{1,2})?"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount*"
              className="p-2 border rounded flex-1"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-2 border rounded flex-1"
            >
              <option value="">Select Category*</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1">
              <label htmlFor="expenseDate" className="block mb-1">Expense Date*</label>
              <input
                id="expenseDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="p-2 border rounded w-full"
                placeholder="Select Expense Date"
              />
            </div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="p-2 border rounded flex-1"
            />
          </div>
          <button
            type="submit"
            className="bg-black text-black p-2 rounded hover:bg-gray-800 transition duration-300"
          >
            {editingExpense ? 'Update Expense' : 'Add Expense'}
          </button>
        </form>
      </div>

      {/* Filters & Sorting */}
      <div className="bg-white shadow rounded p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Filters & Sorting</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Categories</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Entertainment">Entertainment</option>
          </select>
          <div>
            <label htmlFor="startDate" className="block mb-1">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="p-2 border rounded w-full"
              placeholder="Select Start Date"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block mb-1">End Date</label>
            <input
              id="endDate"
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="p-2 border rounded w-full"
              placeholder="Select End Date"
            />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded"
            placeholder="Search Note"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="p-2 border rounded"
          >
            <option value="date_desc">Latest Date</option>
            <option value="date_asc">Oldest Date</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>
        <button
          onClick={() => {
            setFilterCategory('');
            setFilterStartDate('');
            setFilterEndDate('');
            setSearchQuery('');
          }}
          className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition duration-300"
        >
          Reset Filters
        </button>
      </div>

      {/* Expenses List */}
      <div className="bg-white shadow rounded p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">
          Expenses ({filteredExpenses.length})
        </h3>
        {filteredExpenses.length === 0 ? (
          <p>No expenses found. Try resetting filters or adding new expenses.</p>
        ) : (
          <ul className="space-y-4">
            {filteredExpenses.map((expense) => (
              <li
                key={expense.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded hover:shadow transition"
              >
                <div>
                  <p className="font-medium">
                    {expense.date.toLocaleDateString()} - {expense.category}
                  </p>
                  <p>
                    ${expense.amount.toFixed(2)}{' '}
                    {expense.note && `- ${expense.note}`}
                  </p>
                </div>
                <div className="mt-2 md:mt-0 flex space-x-4">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="bg-white shadow rounded p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">
          Summary Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded text-center">
            <p className="text-2xl font-bold">
              ${totalAmount.toFixed(2)}
            </p>
            <p>Total Amount</p>
          </div>
          <div className="p-4 border rounded text-center">
            <p className="text-2xl font-bold">{totalExpenses}</p>
            <p>Number of Expenses</p>
          </div>
          <div className="p-4 border rounded text-center">
            <p className="text-2xl font-bold">
              ${highestExpense.toFixed(2)}
            </p>
            <p>Highest Expense</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white shadow rounded p-6">
        <h3 className="text-xl font-semibold mb-4">
          Category Breakdown
        </h3>
        <div className="mb-4 flex items-center space-x-2">
          <label htmlFor="chartType" className="font-medium">
            Chart Type:
          </label>
          <select
            id="chartType"
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
            className="p-2 border rounded"
          >
            <option value="pie">Pie</option>
            <option value="doughnut">Doughnut</option>
            <option value="bar">Bar</option>
            <option value="line">Line</option>
          </select>
        </div>
        <div className="w-full md:w-2/3 mx-auto">
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;