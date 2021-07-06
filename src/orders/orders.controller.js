const path = require('path');

// Use the existing order data
const orders = require(path.resolve('src/data/orders-data'));

// Use this function to assigh ID's when necessary
const nextId = require('../utils/nextId');

// TODO: Implement the /orders handlers needed to make the tests pass

function orderExists(request, response, next) {
  const { orderId } = request.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    response.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order id not found: ${orderId}`,
  });
}

function orderValidation(request, response, next) {
  const {deliverTo, mobileNumber, dishes} = request.body.data;
  if (!deliverTo) {
    next({
      status: 400,
      message: 'Order must include a deliverTo',
    });
  }
  if (!mobileNumber) {
    next({
      status: 400,
      message: 'Order must include a mobileNumber',
    });
  }
  if (dishes === undefined) {
    next({
      status: 400,
      message: 'Order must include a dish',
    });
  }
  if (!Array.isArray(dishes) || dishes.length === 0){
    next({
      status: 400,
      message: 'Order must include at least one dish',
    });
  }
  dishes.forEach((dish, index)=> {
    if (!dish.quantity || typeof dish.quantity !== 'number'){
      next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });
  next();
}

function list(request, response) {
  response.json({ data: orders });
}

function read(request, response, next) {
  response.json({ data: response.locals.order });
}

function destroy(request, response, next) {
  const { orderId } = request.params;
  const order = orders.find((order) => order.id === orderId);
  if (order.status !== 'pending'){
    next({
      status: 400,
      message: 'An order cannot be deleted unless it is pending',
    }); 
  }
  const index = orders.findIndex((order) => order.id === orderId);
  orders.splice(index, 1);
  response.sendStatus(204);
}

function update(request, response, next) {
  const order = response.locals.order;
  const {deliverTo, mobileNumber, dishes, status, id} = request.body.data;
  const {orderId} = request.params;
  if (id && id !== orderId) {
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });
  }
  if (!status || !'pendingpreparingout-for-delivery'.includes(status)){
    next({
      status: 400,
      message: 'Order must have a status of pending, preparing, out-for-delivery, delivered',
    });
  }
  console.log(status);
  if (order.status === 'delivered'){
    console.log('bad status');
    next({
      status: 400,
      message: 'A delivered order cannot be changed',
    });
  }
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.dishes = dishes;
  order.status = status;
  response.json({ data: order });
}

function create(request, response, next) {
  console.log('log');
  const {deliverTo, mobileNumber, dishes} = request.body.data;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    dishes,
  };
  orders.push(newOrder);
  response.status(201).json({ data: newOrder });
}

module.exports = {
  update: [orderExists, orderValidation, update],
  create: [orderValidation, create],
  list,
  read: [orderExists, read],
  delete: [orderExists, destroy],
};