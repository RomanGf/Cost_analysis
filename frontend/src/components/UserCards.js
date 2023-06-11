  import React, { useEffect, useState } from "react";
  import UsersService from "../components/UserService";
  import { Link } from "react-router-dom";
  import { useParams } from "react-router-dom";

  const usersService = new UsersService();

  const UserCardsList = (props) => {
    const [cards, setCards] = useState([]);
    const [currencyDict, setCurrencyDict] = useState([]);
    const [user] = useState(props.user);
    const { id } = useParams();

    useEffect(() => {
      usersService.getUserCards(id).then((result) => {
        setCards(result.cards);
        setCurrencyDict(result.currency_constant);
      });
    }, [id]);

    useEffect(() => {
      document.title = "Cards";
    }, []);

    return (
      <div className="customers--list">
        <table className="table">
          <thead key="thead">
            <tr>
              <th>#</th>
              <th>Monobank id</th>
              <th>Currency Code</th>
              <th>Balance</th>
              <th>Credit Limit</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr key={card.id}>
                <td>{card.id}</td>
                <td>{card.monobank_id}</td>
                <td>{currencyDict[card.currencyCode]}</td>
                <td>{card.balance}</td>
                <td>{card.creditLimit}</td>
                <td>
                  <Link to={`/get_user_cards/${user.id}/${card.monobank_id}`}>
                    <button className="btn btn-primary">Статистика</button>
                  </Link>
                </td>
                <td>
                  <Link to={`/get_user_cards_compare/${user.id}/${card.monobank_id}`}>
                    <button className="btn btn-primary">Порівняння за період</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  export default UserCardsList;
