import React, { Component } from 'react';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown'
import Nav from 'react-bootstrap/Nav';

import { LinkContainer } from 'react-router-bootstrap';

import userService from '../../../services/user.service';

export default class Header extends Component {

  render() {
    return (
      <header className="fixed-top">
        <Navbar collapseOnSelect expand="lg" bg="primary" variant="dark">
          <LinkContainer to="/main">
            <Navbar.Brand>Vardiety</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mr-auto">
              <NavDropdown title="Cadastros" bg="primary">
                <NavDropdown.Item>
                  <LinkContainer to="/main/register-restrictions">
                    <Nav.Link><font color="black">Restrições</font></Nav.Link>
                  </LinkContainer>
                </NavDropdown.Item>
                <NavDropdown.Item>
                  <LinkContainer to="/main/register-components">
                    <Nav.Link><font color="black">Componentes</font></Nav.Link>
                  </LinkContainer>
                </NavDropdown.Item>
              </NavDropdown>
              {
                userService.userType === 'NUT' &&
                <LinkContainer to="/main/patient-list">
                  <Nav.Link>Lista de pacientes</Nav.Link>
                </LinkContainer>
              }
              {
                userService.userType === 'PAC' &&
                <LinkContainer to="/main/nutritionist-list">
                  <Nav.Link>Lista de nutricionistas</Nav.Link>
                </LinkContainer>
              }
            </Nav>
            <Form inline>
              <Button variant="outline-light">Sair</Button>
            </Form>
          </Navbar.Collapse>
        </Navbar>
      </header>
    );
  }
}