import React, { useEffect, useState } from "react";
import UsersService from "../components/UserService";
import { useParams } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import { Bar } from "react-chartjs-2";
import "../css/styles.css";
import { Link } from "react-router-dom";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "../css/userCardTransactions.css";
import Select from "react-select";

import {
  Chart,
  LinearScale,
  CategoryScale,
  BarElement,
  PieController,
  ArcElement,
  LineController,
  PointElement,
  LineElement,
} from "chart.js";

Chart.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PieController,
  ArcElement,
  LineController,
  PointElement,
  LineElement
);

const TransactionBarChart = ({ transactions, mcc_dict }) => {
  const data = {
    labels: transactions.map((transaction) => mcc_dict[transaction.mcc]),
    datasets: [
      {
        label: "Витрати",
        data: transactions.map((transaction) => transaction.total_amount),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="chart-container">
      <div className="graph_width_chart">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

const usersService = new UsersService();

const UserCardTransactionsList = () => {
  const [transactions, setTransactions] = useState([]);
  const [transactions_chart, setTransactionsChart] = useState([]);
  const [mccDict, setMccDict] = useState([]);
  const [amountGT, setAmountGT] = useState(null);
  const [amountLT, setAmountLT] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);
  const { pk, monobank_id } = useParams();
  const [selectedMCC, setSelectedMCC] = useState([]);

  useEffect(() => {
    usersService.getUserCardTransactions(pk, monobank_id).then((result) => {
      setTransactions(result.transactions);
      setTransactionsChart(result.transactions_chat_js);
      setMccDict(result.mcc_dict);
      setSelectedMCC([]);
    });
  }, [pk, monobank_id]);

  useEffect(() => {
    document.title = "Transactions";
  }, []);

  const handleDateChange = (ranges) => {
    setSelectedDateRange([ranges.selection]);
  };

  const handleMCCChange = (selectedOptions) => {
    setSelectedMCC(selectedOptions.map((option) => option.value));
  };

  const handleAmountGTChange = (event) => {
    setAmountGT(event.target.value);
  };

  const handleAmountLTChange = (event) => {
    setAmountLT(event.target.value);
  };

  const handleFilterTransactions = () => {
    const startDate = selectedDateRange[0].startDate;
    const endDate = selectedDateRange[0].endDate;

    if ((startDate && endDate) || selectedMCC) {
      usersService
        .filterUserCardTransactions(
          pk,
          monobank_id,
          selectedMCC,
          startDate,
          endDate,
          amountGT,
          amountLT
        )
        .then((result) => {
          setTransactions(result.transactions);
          setTransactionsChart(result.transactions_chat_js);
          console.log(result);
          setMccDict(result.mcc_dict);
        });
    }
  };

  return (
    <div className="customers--list">
      <div>
        <h1>Графік витрат</h1>
        <div className="chart-section">
          <TransactionBarChart
            transactions={transactions_chart}
            mcc_dict={mccDict}
          />
        </div>
      </div>

      <h1>Таблиця транзакцій</h1>
      <div className="filters-section">
        <div>
          <div>
            <label htmlFor="mccSelect">MCC:</label>
            <Select
              id="mccSelect"
              // value={selectedMCC}
              onChange={handleMCCChange}
              options={Object.entries(mccDict).map(([code, description]) => ({
                label: description,
                value: code,
              }))}
              isMulti
            />
          </div>
          <div>
            <label htmlFor="amount_gt">Сума більша за:</label>
            <input
              type="number"
              id="amount_gt"
              name="amount_gt"
              onChange={handleAmountGTChange}
            ></input>
          </div>
          <div>
            <label htmlFor="amount_lt">Сума менша за:</label>
            <input
              type="number"
              id="amount_lt"
              name="amount_lt"
              onChange={handleAmountLTChange}
            ></input>
          </div>
        </div>
        <div className="daterangelicker_filter">
          <div>
            <label htmlFor="datePicker">Діапазон дат:</label>
            <DateRangePicker
              id="datePicker"
              ranges={selectedDateRange}
              onChange={handleDateChange}
            />
          </div>
        </div>
      </div>
      <div className="filter_button">
        <button className="btn btn-primary" onClick={handleFilterTransactions}>
          Фільтрувати
        </button>
      </div>
      <h2>Транзакції</h2>
      <table className="table">
        <thead key="thead">
          <tr>
            <th>#</th>
            <th>ID Транзакції</th>
            <th>Час</th>
            <th>Опис</th>
            <th>Сума</th>
            <th>MCC</th>
            <th>Коментар</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>
                <Link to={`/transaction/${transaction.id}`}>
                  {transaction.id}
                </Link>
              </td>
              <td>{transaction.transaction_id}</td>
              <td>{transaction.time}</td>
              <td>{transaction.description}</td>
              <td>{transaction.amount}</td>
              <td>{mccDict[transaction.mcc]}</td>
              <td>{transaction.comment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserCardTransactionsList;
