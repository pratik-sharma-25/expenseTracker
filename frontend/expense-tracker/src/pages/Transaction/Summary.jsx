import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const Summary = () => {
  const fetchedTransactions = [
    { id: 1, description: 'Salary', amount: 5000, date: '2024-01-01' },
    { id: 2, description: 'Groceries', amount: -150, date: '2024-07-05' },
    { id: 3, description: 'Rent', amount: -1200, date: '2024-08-10' },
    { id: 4, description: 'Freelance', amount: 800, date: '2024-06-15' },
    { id: 5, description: 'Asds', amount: 600, date: '2023-06-15' },
    // Add more transactions as needed
  ];

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [timePeriod, setTimePeriod] = useState('yearly');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    const calculateSummary = () => {
      let totalIncome = 0;
      let totalExpenses = 0;

      filteredTransactions.forEach((transaction) => {
        if (transaction.amount > 0) {
          totalIncome += transaction.amount;
        } else {
          totalExpenses += Math.abs(transaction.amount);
        }
      });

      setSummary({
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
      });
    };

    const filterTransactions = () => {
      const now = new Date();
      let filtered = [];

      if (timePeriod === 'yearly') {
        filtered = fetchedTransactions.filter((transaction) => {
          const transactionDate = new Date(transaction.date);
          return transactionDate.getFullYear() === now.getFullYear();
        });

        console.log(filtered, 'filtered');
      } else if (timePeriod === 'monthly') {
        filtered = fetchedTransactions.filter((transaction) => {
          const transactionDate = new Date(transaction.date);
          return (
            transactionDate.getFullYear() === now.getFullYear() &&
            transactionDate.getMonth() === now.getMonth()
          );
        });
      } else if (timePeriod === 'weekly') {
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        filtered = fetchedTransactions.filter((transaction) => {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= startOfWeek && transactionDate <= endOfWeek;
        });
      }

      setFilteredTransactions(filtered);
    };

    filterTransactions();
    calculateSummary();
    console.log(filteredTransactions.map((transaction) => transaction.date))
  }, [timePeriod]);

  const data = {
    labels: filteredTransactions.map((transaction) => transaction.date),
    datasets: [
      {
        label: 'Income',
        data: filteredTransactions
          .filter((transaction) => transaction.amount > 0)
          .map((transaction) => transaction.amount),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Expenses',
        data: filteredTransactions
          .filter((transaction) => transaction.amount < 0)
          .map((transaction) => Math.abs(transaction.amount)),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  return (
    <div>
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4">
          <h2 className="text-2xl font-bold mb-4">Transaction Summary</h2>
          <div className="mb-4">
            <button onClick={() => setTimePeriod('yearly')} className="mr-2">Yearly</button>
            <button onClick={() => setTimePeriod('monthly')} className="mr-2">Monthly</button>
            <button onClick={() => setTimePeriod('weekly')}>Weekly</button>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Income:</span>
            <span className="summary-value">${summary.totalIncome.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Expenses:</span>
            <span className="summary-value">${summary.totalExpenses.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Balance:</span>
            <span className="summary-value">${summary.balance.toFixed(2)}</span>
          </div>
          <div className="mt-4">
            <Bar data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;