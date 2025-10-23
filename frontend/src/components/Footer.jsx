// src/components/Footer.jsx
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer>
      <Container>
        <Row>
          <Col className="text-center py-3">
            <p>USG Breast Cancer Predictor &copy; {new Date().getFullYear()}</p>
            <small>Disclaimer: This is an educational tool and not for medical diagnosis.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;