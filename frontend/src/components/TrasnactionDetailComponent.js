import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UsersService from "../components/UserService";
import "../css/styles.css";

const usersService = new UsersService();

const TransactionDetail = () => {
  const [transaction, setTransaction] = useState();
  const [mccDict, setMccDict] = useState([]);
  const [comment, setComment] = useState("");
  const { id } = useParams();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await usersService.transactionDetail(id);
      setTransaction(result.transaction);
      setMccDict(result.mcc_dict);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    document.title = "Transaction detail";
  }, []);

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmitComment = (event) => {
    event.preventDefault();
    usersService.transactionDetailPost(id, comment).then((result) => {
      setTransaction(result.transaction);
    });
    setComment("");
  };

  return (
    <div className="transaction-details">
      <h2>Деталі Транзакції</h2>
      <p>ID: {transaction?.id}</p>
      <p>ID Транзакції: {transaction?.transaction_id}</p>
      <p>Час: {transaction?.time}</p>
      <p>Опис: {transaction?.description}</p>
      <p>Сума: {transaction?.amount}</p>
      <p>MCC: {mccDict[transaction?.mcc]}</p>
      <p>Коментар: {transaction?.comment}</p>

      <form onSubmit={handleSubmitComment}>
        <label htmlFor="commentInput">Додати коментар:</label>
        <input
          id="commentInput"
          type="text"
          value={comment}
          onChange={handleCommentChange}
        />
        <button
        className="btn btn-primary add_comment"
        type="submit">Зберегти коментар</button>
      </form>
    </div>
  );
};

export default TransactionDetail;
