import React, { Component } from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import MealItem from './meal-item';

export default class Meal extends Component {
  state = {
    meal: {
      id: null,
      name: '',
      items: [],
      internalId: null
    }
  }

  componentDidMount() {
    this.setState({
      meal: {
        ...this.props.meal
      },
      isHoveringName: false,
      isEditingName: false
    });
  }

  handleMealChange = () => {
    this.props.onChangeMeal && this.props.onChangeMeal({ ...this.state.meal }, this.props.mealIndex);
  }

  handleItemChange = (item, index) => {
    const state = {
      ...this.state
    };

    state.meal.items[index] = item;

    this.setState(state, this.handleMealChange);
  }

  handleItemAddition = () => {
    const state = {
      ...this.state
    };

    state.meal.items.push({
      id: null,
      description: '',
      amount: ''
    });

    this.setState(state, this.handleMealChange);
  }

  handleItemRemoval = itemIndex => {
    const state = {
      ...this.state
    };

    state.meal.items.splice(itemIndex, 1);

    this.setState(state, this.handleMealChange);
  }

  handleMealNameChange = event => {
    const state = {
      ...this.state
    };

    state.meal.name = event.target.value;

    this.setState(state, this.handleMealChange);
  }

  handleMealNameEdit = () => {
    this.setState({
      isEditingName: true,
      isHoveringName: false
    }, () => {
      this.mealNameInput.focus();
      this.mealNameInput.select();
    });
  }

  handleSubmit = event => {
    event.preventDefault();

    this.setState({
      isEditingName: false,
      isHoveringName: false
    });
  }

  render() {
    return (
      <div>
        <Row className="p-3 d-flex justify-content-center">
          <Col md={8}>
            <div
              id="meal-name"
              onMouseOver={() => { this.setState({ isHoveringName: true }) }}
              onMouseLeave={() => { this.setState({ isHoveringName: false }) }} >
              {
                !this.state.isEditingName &&
                <p
                  className="h5 d-inline-block">
                  {this.state.meal.name}
                </p>
              }

              {
                this.state.isHoveringName &&
                <div className="d-inline">
                  <span
                    style={{ cursor: 'pointer' }}
                    className="ml-3 oi oi-pencil"
                    onClick={this.handleMealNameEdit}>
                  </span>

                  <span
                    style={{ cursor: 'pointer' }}
                    className="ml-3 oi oi-x"
                    onClick={() => { this.props.onRemoveMeal && this.props.onRemoveMeal(this.props.mealIndex) }} >
                  </span>
                </div>
              }
            </div>

            {
              this.state.isEditingName &&
              <Form
                inline
                onSubmit={this.handleSubmit}
                ref={form => { this.mealNameForm = form }} >
                <Form.Row>
                  <Form.Control
                    type="text"
                    name="name"
                    value={this.state.meal.name}
                    onChange={this.handleMealNameChange}
                    onBlur={this.handleSubmit}
                    required
                    ref={input => { this.mealNameInput = input }} />
                </Form.Row>
              </Form>
            }

            {
              this.state.meal.items.map((item, index) => (
                <MealItem
                  key={index}
                  item={item}
                  itemIndex={index}
                  onChangeItem={this.handleItemChange}
                  onRemoveItem={this.handleItemRemoval} />
              ))
            }

            <div className="d-flex justify-content-end">
              <Button
                variant="success"
                onClick={this.handleItemAddition}>
                <span className="oi oi-plus"></span>
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}
