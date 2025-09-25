import React, { useState } from "react";
import { Form, Button, Row, Col, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const SearchBox = () => {
  const [keyword, setKeyword] = useState("");
  const history = useNavigate();
  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      history(`/search/${keyword}`);
    } else {
      history("/");
    }
  };

  return (
    <Container>
      <Form onSubmit={submitHandler} inline>
        <Row>
          <Col>
            <Form.Control
              type="text"
              name="q"
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search..."
              className="mr-sm-2 mi-sm-5"
            ></Form.Control>
          </Col>
          <Col>
            <Button
              type="submit"
              variant="outline-success"
              className="p-2"
              size="sm"
              style={{
                borderRadius: " 20%",
                marginRight: "0px",
                width: "60px",
              }}
            >
              Search
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default SearchBox;
