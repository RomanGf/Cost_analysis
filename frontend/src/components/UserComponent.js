import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, CardFooter, Col, Container, Row, Table } from "reactstrap";
import { Link } from "react-router-dom";
import UsersService from "../components/UserService";

const usersService = new UsersService();

const ViewUserProfile = (props) => {
  const [user, setUser] = useState([]);
  const [userData] = useState(props.user);


  useEffect(() => {
    console.log(userData);
    getUserData(userData.id);
  }, []);

  useEffect(() => {
    document.title = "Cards ";
  }, []);


  const getUserData = (pk) => {
    usersService.getUser(pk).then((result) => {
      setUser(result);
    });
  };

  return (
    <Card className="mt-2 border-0 rounded-0 shadow-sm">
      <CardBody>
        <h3 className="text-uppercase">Інформація користувача</h3>

        <Container className="text-center">
          <img
            style={{ maxWidth: "200px", maxHeight: "200px" }}
            src="https://cdn.dribbble.com/users/6142/screenshots/5679189/media/1b96ad1f07feee81fa83c877a1e350ce.png?compress=1&resize=400x300&vertical=top"
            alt="user profile picture"
            className="img-fluid rounded-circle"
          />
        </Container>
        <Table responsive striped hover bordered={true} className="text-center mt-5">
          <tbody>
            <tr>
              <td>Ім'я</td>
              <td>{user.username}</td>
            </tr>
            <tr>
              <td>Елкктрона пошта</td>
              <td>{user.email}</td>
            </tr>
            <tr>
              <td>Токен monobank</td>
              <td>{user.token_monobank}</td>
            </tr>
          </tbody>
        </Table>
      </CardBody>
      <CardFooter>
        <Link to={`/user/${user.pk}`}>
          <Button color="primary">Додати токен</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ViewUserProfile;
