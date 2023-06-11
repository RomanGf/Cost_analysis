import React, { useEffect, useRef } from "react";

import UsersService from "../components/UserService";
import { useParams, useNavigate } from "react-router-dom";

const customersService = new UsersService();

const UserUpdate = () => {
  const token_monobankRef = useRef(null);
  const { pk } = useParams();
  const navigate = useNavigate();

  const handleUpdate = () => {
    customersService
      .updateUser({
        pk: pk,
        token_monobank: token_monobankRef.current.value,
      })
      .then((result) => {
        navigate("/user_profile");
      })
      .catch(() => {
        alert(token_monobankRef.current.value);
      });
  };

  useEffect(() => {
    document.title = "Profile";
  }, []);

  const handleSubmit = (event) => {
    handleUpdate();
    event.preventDefault();
  };

  return (
    <div>
      <div>
        <h2>
          Щоб отримати свій токен перейдіть:
          <a href="https://api.monobank.ua/" target="_blank">
            сюди.
          </a>
        </h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Monobank Token:</label>
          <input className="form-control" type="text" ref={token_monobankRef} />
          <input className="btn btn-primary" type="submit" value="Submit" />
        </div>
      </form>
    </div>
  );
};

export default UserUpdate;
