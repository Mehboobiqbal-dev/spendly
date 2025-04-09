import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: Date;
  note?: string;
}

export const useExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      console.log('No user authenticated');
      setLoading(false);
      return;
    }

    console.log('Fetching expenses for user:', user.uid);
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      expensesQuery,
      (snapshot) => {
        console.log('Snapshot received with', snapshot.docs.length, 'documents');
        try {
          const data = snapshot.docs.map((doc) => {
            const expenseData = doc.data();
            let dateValue: Date;
            if (expenseData.date && typeof expenseData.date.toDate === 'function') {
              dateValue = expenseData.date.toDate();
            } else if (expenseData.date) {
              dateValue = new Date(expenseData.date);
            } else {
              console.warn('No valid date for expense:', doc.id);
              dateValue = new Date();
            }
            console.log('Fetched expense ID:', doc.id, 'Data:', { ...expenseData, date: dateValue });
            return {
              id: doc.id,
              amount: expenseData.amount,
              category: expenseData.category,
              date: dateValue,
              note: expenseData.note,
            };
          });
          setExpenses(data);
          setLoading(false);
          setError(null);
        } catch (error) {
          console.error('Error processing snapshot:', error);
          setError('Failed to process expenses data');
          setLoading(false);
        }
      },
      (error) => {
        console.error('Firestore listen error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => {
      console.log('Unsubscribing from expenses listener');
      unsubscribe();
    };
  }, [user]);

  return { expenses, loading, error };
};