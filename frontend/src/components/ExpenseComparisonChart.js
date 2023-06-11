import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useParams } from "react-router-dom";
import UsersService from "../components/UserService";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "../css/styles.css";

const usersService = new UsersService();

const ExpenseComparisonChart = () => {
  const [currentMonthData, setCurrentMonthData] = useState([]);
  const [previousMonthData, setPreviousMonthData] = useState([]);
  const [mccDict, setMccDict] = useState([]);
  const { pk, monobank_id } = useParams();
  const [selectedDateRangeFirst, setSelectedDateRangeFirst] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [selectedDateRangeSecond, setSelectedDateRangeSecond] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await usersService.getCurrentMonthTransactions(
        pk,
        monobank_id
      );
      setCurrentMonthData(result.transactions_chat_js);
      setPreviousMonthData(result.transactions_chat_js_second);
      setMccDict(result.mcc_dict);
    } catch (error) {}
  };

  useEffect(() => {
    document.title = "Compare";
  }, []);

  const handleDateChangeFirst = (ranges) => {
    setSelectedDateRangeFirst([ranges.selection]);
  };

  const handleDateChangeSecond = (ranges) => {
    setSelectedDateRangeSecond([ranges.selection]);
  };

  const generateChartData = (transactions) => {
    const labels = transactions.map((transaction) => mccDict[transaction.mcc]);
    const data = transactions.map((transaction) => transaction.total_amount);

    return {
      labels,
      datasets: [
        {
          label: "Витрати",
          data,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const handleFilterTransactionsCompare = () => {
    const startDateFirst = selectedDateRangeFirst[0].startDate;
    const endDateFirst = selectedDateRangeFirst[0].endDate;
    const startDateSecond = selectedDateRangeSecond[0].startDate;
    const endDateSecond = selectedDateRangeSecond[0].endDate;

    if (
      (startDateFirst && endDateFirst) ||
      (startDateSecond && endDateSecond)
    ) {
      usersService
        .filterUserCardTransactionsCompare(
          pk,
          monobank_id,
          startDateFirst,
          endDateFirst,
          startDateSecond,
          endDateSecond
        )
        .then((result) => {
          setCurrentMonthData(result.transactions_chat_js);
          setPreviousMonthData(result.transactions_chat_js_second);
          setMccDict(result.mcc_dict);
        });
    }
  };
  const currentMonthChartData = generateChartData(currentMonthData);
  const previousMonthChartData = generateChartData(previousMonthData);
  return (
    <div>
      <h2>Порівняння витрат</h2>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "45%" }}>
          <h3>Дата за перший період</h3>
          <div className="filter_column">
            <DateRange
              onChange={handleDateChangeFirst}
              ranges={selectedDateRangeFirst}
            />
            <button
              className="btn btn-primary"
              onClick={handleFilterTransactionsCompare}
            >
              Фільтрувати
            </button>
          </div>

          <Bar data={currentMonthChartData} />
        </div>
        <div style={{ width: "45%" }}>
          <h3>Дата за другий період</h3>
          <div className="filter_column">
            <div></div>
            <DateRange
              onChange={handleDateChangeSecond}
              ranges={selectedDateRangeSecond}
            />
            <button
              className="btn btn-primary"
              onClick={handleFilterTransactionsCompare}
            >
              Фільтрувати
            </button>
          </div>

          <Bar data={previousMonthChartData} />
        </div>
      </div>
    </div>
  );
};

export default ExpenseComparisonChart;
