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
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Timestamp } from 'firebase/firestore';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { expenses, loading, error } = useExpenses();

  // Form states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [notification, setNotification] = useState('');

  // Filter and sort states
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Memoized filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((expense) => {
        const expenseDate = expense.date;
        const matchesCategory = filterCategory ? expense.category === filterCategory : true;
        const matchesStartDate = filterStartDate ? expenseDate >= new Date(filterStartDate) : true;
        const matchesEndDate = filterEndDate ? expenseDate <= new Date(filterEndDate) : true;
        const matchesSearch = searchQuery
          ? expense.note?.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        return matchesCategory && matchesStartDate && matchesEndDate && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.getTime() - a.date.getTime();
        if (sortBy === 'date_asc') return a.date.getTime() - b.date.getTime();
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [expenses, filterCategory, filterStartDate, filterEndDate, searchQuery, sortBy]);

  // Debug state updates
  useEffect(() => {
    console.log('User:', user);
    console.log('Expenses:', expenses);
    console.log('Filtered Expenses:', filteredExpenses);
  }, [user, expenses, filteredExpenses]);

  // Category totals for Pie Chart
  const getCategoryTotals = (exps: Expense[]) => {
    const totals: { [key: string]: number } = {};
    exps.forEach((expense) => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });
    return totals;
  };

  const categoryTotals = getCategoryTotals(expenses);
  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#8A2BE2', '#00FA9A'],
      },
    ],
  };

  // Summary statistics
  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((acc, expense) => acc + expense.amount, 0);
  const highestExpense =
    expenses.length > 0
      ? expenses.reduce((max, expense) => (expense.amount > max ? expense.amount : max), expenses[0].amount)
      : 0;

  // Add or update expense
  const handleAddOrUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setNotification('User not authenticated.');
      return;
    }

    if (!amount || !category || !date) {
      setNotification('Please fill in all required fields.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      setNotification('Invalid amount.');
      return;
    }

    const expenseDate = new Date(date);
    if (isNaN(expenseDate.getTime())) {
      setNotification('Invalid date.');
      return;
    }

    const expenseData = {
      userId: user.uid,
      amount: parsedAmount,
      category,
      date: Timestamp.fromDate(expenseDate),
      note: note.trim(),
    };

    try {
      if (editingExpense) {
        const expenseRef = doc(db, 'expenses', editingExpense.id);
        await updateDoc(expenseRef, expenseData);
        console.log('Updated expense:', editingExpense.id, expenseData);
        setNotification('Expense updated successfully!');
        setEditingExpense(null);
      } else {
        const docRef = await addDoc(collection(db, 'expenses'), expenseData);
        console.log('Added expense with ID:', docRef.id, 'for user:', user.uid, expenseData);
        setNotification('Expense added successfully!');
      }
      setAmount('');
      setCategory('');
      setDate('');
      setNote('');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      console.error('Error processing expense:', err);
      setNotification('Error processing expense.');
    }
  };

  // Delete expense
  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
      console.log('Deleted expense:', id);
      setNotification('Expense deleted successfully!');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      console.error('Error deleting expense:', err);
      setNotification('Error deleting expense.');
    }
  };

  // Edit expense
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDate(expense.date.toISOString().split('T')[0]);
    setNote(expense.note || '');
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // Render logic with error handling
  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        Error: {error} <br />
        Please check the console for more details or ensure Firestore setup is correct.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-600">Dashboard</h2>
        <button onClick={handleLogout} className="text-blue-500 hover:underline transition duration-300">
          Logout
        </button>
      </div>

      {notification && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 border border-green-300 rounded">
          {notification}
        </div>
      )}

      <div className="bg-white shadow rounded p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">{editingExpense ? 'Edit Expense' : 'Add Expense'}</h3>
        <form onSubmit={handleAddOrUpdateExpense} className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:space-x-4">
            <input
              type="number"
              step="0.01"
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
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2 border rounded flex-1"
            />
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
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300"
          >
            {editingExpense ? 'Update Expense' : 'Add Expense'}
          </button>
        </form>
      </div>

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
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="p-2 border rounded"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="p-2 border rounded"
            placeholder="End Date"
          />
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

      <div className="bg-white shadow rounded p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Expenses ({filteredExpenses.length})</h3>
        {filteredExpenses.length === 0 ? (
          <p className="text-gray-500">No expenses found. Try resetting filters or adding new expenses.</p>
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
                  <p className="text-gray-600">
                    ${expense.amount.toFixed(2)} {expense.note && `- ${expense.note}`}
                  </p>
                </div>
                <div className="mt-2 md:mt-0 flex space-x-4">
                  <button
                    onClick={() => handleEditExpense(expense)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white shadow rounded p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded text-center">
            <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
            <p className="text-gray-600">Total Amount</p>
          </div>
          <div className="p-4 border rounded text-center">
            <p className="text-2xl font-bold">{totalExpenses}</p>
            <p className="text-gray-600">Number of Expenses</p>
          </div>
          <div className="p-4 border rounded text-center">
            <p className="text-2xl font-bold">${highestExpense.toFixed(2)}</p>
            <p className="text-gray-600">Highest Expense</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded p-6">
        <h3 className="text-xl font-semibold mb-4">Category Breakdown</h3>
        {expenses.length === 0 ? (
          <p className="text-gray-500">No data to display.</p>
        ) : (
          <div className="w-full md:w-1/2 mx-auto">
            <Pie data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;