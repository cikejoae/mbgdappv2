import React from "react";
import "./App.css";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import Container from 'react-bootstrap/Container';

import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  return (
    <Container>
    <Navbar collapseOnSelect expand="sm" bg="black" variant="dark">
      <Navbar.Brand href=".">
      <img src="apotheosis.png" width="" height="38" alt=""></img>
        {/* <Logo
          alt=""
          width="30"
          height="30"
          className="d-inline-block align-top"
        />
        Dice Roller */}
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="ms-auto navbarfont navbar-header">
          <Nav.Link active href=".">DASHBOARD</Nav.Link>
          <Nav.Link active href="#Vault">VAULT</Nav.Link>
          <Nav.Link active href="#NFTs">NFTs</Nav.Link>
          <Nav.Link active href="https://osis.world" target="_blank" rel="noreferrer">OSIS.WORLD</Nav.Link>
          <Nav.Link active href="https://osis.world/login" target="_blank" rel="noreferrer">GET OSIS</Nav.Link>
          {/* <NavDropdown title="Dropdown" id="collasible-nav-dropdown">
            <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.2">
              Another action
            </NavDropdown.Item>
            <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href="#action/3.4">
              Separated link
            </NavDropdown.Item>
          </NavDropdown> */}
        </Nav>
        {/* <Nav>
          <Nav.Link href="#deets">More deets</Nav.Link>
          <Nav.Link eventKey={2} href="#memes">
            Dank memes
          </Nav.Link>
        </Nav> */}
      </Navbar.Collapse>
    </Navbar>
    </Container>
  );
}
