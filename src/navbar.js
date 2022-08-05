import React from "react";
import "./App.css";
import { Nav, Navbar } from "react-bootstrap";
import Container from 'react-bootstrap/Container';

import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  return (
    <Container>
    <Navbar collapseOnSelect expand="sm" bg="black" variant="dark">
      <Navbar.Brand href=".">
      <img src="apotheosis.png" width="" height="38" alt=""></img>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="ms-auto navbarfont navbar-header">
          <Nav.Link active href=".">DASHBOARD</Nav.Link>
          <Nav.Link active href="#Vault">VAULT</Nav.Link>
          <Nav.Link active href="#NFTs">NFTs</Nav.Link>
          <Nav.Link active href="https://osis.world" target="_blank" rel="noreferrer">OSIS.WORLD</Nav.Link>
          <Nav.Link active href="https://osis.world/login" target="_blank" rel="noreferrer">GET OSIS</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
    </Container>
  );
}
