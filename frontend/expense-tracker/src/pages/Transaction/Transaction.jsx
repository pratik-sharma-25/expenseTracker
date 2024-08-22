import React, { useState, useEffect } from 'react';
import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const Transaction = () => {

  // get the list of transactions from the backend
    const [transactions, setTransactions] = useState([]);
    const [totalDocuments, setTotalDocuments] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchTransactions = async (search) => {
        const response = await axiosInstance.get('/expense', {
            params: {
            limit: 5,
            page: currentPage,
            search
            },
        });
        const transactionData = response.data.expenses;
        const totalDocs = response.data.expenseCount;
        setTransactions(transactionData);
        setTotalDocuments(totalDocs);
    }

    const deleteTransaction = async (id) => {
        await axiosInstance.delete(`/expense/${id}`);
        fetchTransactions();
    }

    useEffect(() => {
      fetchTransactions();
    }, [currentPage]);

  const [searchInput, setSearchInput] = useState('');
  const transactionsPerPage = 5;

  const updateTransaction = (id) => {
    const updatedTransactions = transactions.map((transaction) =>
      transaction.id === id ? { ...transaction, description: 'Updated Transaction' } : transaction
    );
    setTransactions(updatedTransactions);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchClick = () => {
        fetchTransactions(searchInput);
  };

//   const filteredTransactions = transactions.filter((transaction) =>
//     transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const indexOfLastTransaction = currentPage * transactionsPerPage;
//   const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
//   const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4">
          <h1 className="text-2xl font-bold mb-4">Transactions</h1>
          <div className="mb-4 flex">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchInput}
              onChange={handleSearchChange}
              className="border p-2 rounded w-full"
            />
            <button
              onClick={handleSearchClick}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
            >
              Search
            </button>
          </div>
          <Link to="create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          <button >
            Add Transaction
          </button>
          </Link>
          <table className="mt-4 w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Title</th>
                <th className="py-2 px-4 border-b">Description</th>
                <th className="py-2 px-4 border-b">Amount</th>
                <th className="py-2 px-4 border-b">Type</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td className="py-2 px-4 border-b">{transaction.title}</td>
                  <td className="py-2 px-4 border-b">{transaction.description}</td>
                  <td className="py-2 px-4 border-b">${transaction.amount}</td>
                  <td className="py-2 px-4 border-b">{transaction.type == "credit" ? "Income" : "Expense"}</td>
                  <td className="py-2 px-4 border-b flex space-x-2">
                    <Link to={`/transaction/edit?id=${transaction._id}`} ><button className="text-blue-500 hover:text-blue-700">
                      <FaEdit />
                    </button>
                    </Link>
                    <Link to={`/transaction/view?id=${transaction._id}`} ><button className="text-blue-500 hover:text-blue-700">
                      <FaEye />
                    </button>
                    </Link>
                    <button onClick={() => deleteTransaction(transaction._id)} className="text-red-500 hover:text-red-700">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-center">
            {Array.from({ length: Math.ceil(totalDocuments / transactionsPerPage) }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`mx-1 px-3 py-1 border rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transaction;