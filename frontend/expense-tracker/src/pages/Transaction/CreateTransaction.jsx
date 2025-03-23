import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const CreateTransaction = ({showData, isUpdate}) => {
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [expenseType, setExpenseType] = useState("");
  const navigateTo = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id'); 

  useEffect(() => {
    // get id from url param


    const fetchTransactions = async () => {
      const response = await axiosInstance.get("/expense/" + id);
      if(response.status === 200) {
        const transaction = response.data;
        const userEnteredDate = new Date(transaction.date).toISOString().split("T")[0];
        setDescription(transaction.description);
        setTitle(transaction.title);
        setAmount(transaction.amount);
        setDate(userEnteredDate);
        setExpenseType(transaction.type);
      }
    };

    fetchTransactions();
  }, []);

  const type = [
    {
      value: "credit",
      label: "Income",
    },
    {
      value: "debit",
      label: "Expense",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission logic here
    const params = {
        title,
        description,
        amount,
        date,
        type: expenseType
        
    }
    if (!id) {
        await axiosInstance.post('/expense/create-expense', params);
    } else {
        await axiosInstance.put('/expense/' + id, params);
    }

    navigateTo('/transaction');
  };

  const currentDate = new Date().toISOString().split("T")[0];
  return (
    <div>
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4">
          <h1 className="text-2xl font-bold mb-4">{isUpdate ? "Update" : "Create"} Transaction</h1>
          <form
            onSubmit={handleSubmit}
            className="bg-white p-4 rounded shadow-md"
          >
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="title"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-2 rounded w-full"
                required
                disabled={showData}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="description"
              >
                Description
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border p-2 rounded w-full"
                required
                disabled={showData}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="amount"
              >
                Amount
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border p-2 rounded w-full"
                required
                disabled={showData}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="date"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={currentDate}
                className="border p-2 rounded w-full"
                required
                disabled={showData}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="type"
              >
                Type
              </label>
              <select
                id="type"
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value)}
                className="border p-2 rounded w-full"
                required
                disabled={showData}
              >
                <option value="" disabled>
                  Select expense type
                </option>
                {type.map((expenseType) => (
                  <option key={expenseType.label} value={expenseType.value}>
                    {expenseType.label}
                  </option>
                ))}
              </select>
            </div>
            {!showData && <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {isUpdate ? "Update" : "Create"} Transaction
            </button>
            }
          </form>
        </div>
      </div>
    </div>
  );
};

CreateTransaction.propTypes = {
  showData: PropTypes.bool,
  isUpdate: PropTypes.bool
};

export default CreateTransaction;
