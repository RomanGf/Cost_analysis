import React, { Component } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Nav from "react-bootstrap/Nav";

import UsersList from "./components/UserList";
import UserUpdate from "./components/UserCreateUpdate";
import UserCardsList from "./components/UserCards";
import UserCardTransactionsList from "./components/UserCardTransactions";
import ViewUserProfile from "./components/UserComponent";
import TransactionDetail from "./components/TrasnactionDetailComponent";
import ExpenseComparisonChartData from "./components/ExpenseComparisonChart";

import "./App.css";

import { useState, useEffect } from "react";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.withCredentials = true;

const client = axios.create({
  baseURL: "http://127.0.0.1:8000/",
});

function App() {
  const [currentUser, setCurrentUser] = useState();
  const [user, setUser] = useState();
  const [registrationToggle, setRegistrationToggle] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    client
      .get("/api/user")
      .then(function (res) {
        setUser(res.data.user);
        setCurrentUser(true);
      })
      .catch(function (error) {
        setCurrentUser(false);
      });
  }, []);

  function update_form_btn() {
    if (registrationToggle) {
      document.getElementById("form_btn").innerHTML = "Register";
      setRegistrationToggle(false);
    } else {
      document.getElementById("form_btn").innerHTML = "Log in";
      setRegistrationToggle(true);
    }
  }

  function submitRegistration(e) {
    e.preventDefault();
    client
      .post("/api/register", {
        email: email,
        username: username,
        password: password,
      })
      .then(function (res) {
        client
          .post("/api/login", {
            email: email,
            password: password,
          })
          .then(function (res) {
            setUser(res.data.user);
            setCurrentUser(true);
          });
      });
  }
  function submitLogin(e) {
    e.preventDefault();
    client
      .post("/api/login", {
        email: email,
        password: password,
      })
      .then(function (res) {
        setUser(res.data);
        setCurrentUser(true);
      });
  }

  function submitLogout(e) {
    e.preventDefault();
    client.post("/api/logout", { withCredentials: true }).then(function (res) {
      setCurrentUser(false);
    });
  }

  if (currentUser) {
    return (
      <BrowserRouter>
        <div className="container-fluid">
          <Navbar className="navbar-dark" bg="dark" variant="dark">
            <Navbar.Toggle aria-controls="navbar-nav" />
            <Navbar.Collapse id="navbar-nav">
              <Nav className="mr-auto">
                <Nav.Link as={Link} to="/user_profile">
                  Профіль
                </Nav.Link>
                <Nav.Link as={Link} to={`/get_user_cards/${user.id}`}>
                  Картки
                </Nav.Link>

                <Nav.Link as={Link} to="/user_profile">
                  {user.email}
                </Nav.Link>

              </Nav>

              <Navbar.Text>
                <form onSubmit={(e) => submitLogout(e)}>
                  <Button type="submit" variant="light" id="log_out">
                    Log out
                  </Button>
                </form>
              </Navbar.Text>
            </Navbar.Collapse>
          </Navbar>

          <div className="content">
            <Routes>
              <Route path="/" exact element={<ViewUserProfile user={user} />} />
              <Route path="/user_profile" exact element={<ViewUserProfile user={user} />} />
              <Route path="/user/:pk" element={<UserUpdate />} />
              <Route path="/user/" exact element={<UserUpdate />} />
              <Route
                path="/transaction/:id"
                exact
                element={<TransactionDetail />}
              />
              <Route
                path="/get_user_cards/:id"
                element={<UserCardsList user={user} />}
              />
              <Route
                path="/get_user_cards/:pk/:monobank_id"
                element={<UserCardTransactionsList />}
              />
              <Route
                path="/get_user_cards_compare/:pk/:monobank_id"
                element={<ExpenseComparisonChartData />}
              />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    );
  }
  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>Вхід</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              <Button id="form_btn" onClick={update_form_btn} variant="light">
                Реєстрація
              </Button>
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {registrationToggle ? (
        <div className="center">
          <Form onSubmit={(e) => submitRegistration(e)}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Form.Text className="text-muted">
                Ми нікому не поширим твою електрону пошту.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label>Псевдонім</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="register_button">
              Підтвердити
            </Button>
          </Form>
        </div>
      ) : (
        <div className="center">
          <Form onSubmit={(e) => submitLogin(e)}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Електрона пошта</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Form.Text className="text-muted">
              Ми нікому не поширим твою електрону пошту.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="login_button">
              Підтвердити
            </Button>
          </Form>
        </div>
      )}
    </div>
  );
}

export default App;
