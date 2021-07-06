const path = require('path');

// Use the existing dishes data
const dishes = require(path.resolve('src/data/dishes-data'));

// Use this function to assign ID's when necessary
const nextId = require('../utils/nextId');

// TODO: Implement the /dishes handlers needed to make the tests pass

function dishValidation(request, response, next) {
  const {name, description, price, image_url} = request.body.data;
  if (!name) {
    next({
      status: 400,
      message: 'Dish must include a name',
    });
  }
  if (!description) {
    next({
      status: 400,
      message: 'Dish must include a description',
    });
  }
  if (price === undefined) {
    next({
      status: 400,
      message: 'Dish must include a price',
    });
  }
  if (typeof price !== 'number' || price <= 0){
    next({
      status: 400,
      message: 'Dish must have a price that is an integer greater than 0',
    });
  }
  if (!image_url) {
    next({
      status: 400,
      message: 'Dish must include a image_url',
    });
  }
  next();
}

function create(request, response, next) {
  const {name, description, price, image_url} = request.body.data
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url
  };
  dishes.push(newDish);
  response.status(201).json({ data: newDish });
}

function dishExists(request, response, next) {
  const { dishId } = request.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    response.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish id not found: ${dishId}`,
  });
}

function list(request, response) {
  response.json({ data: dishes });
}

function read(request, response, next) {
  response.json({ data: response.locals.dish });
}

function update(request, response, next) {
  const dish = response.locals.dish;
  const {dishId} = request.params;
  const {name, description, price, image_url, id} = request.body.data;
  if (id && id !== dishId) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }
  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  response.json({ data: dish });
}

module.exports = {
  create: [dishValidation, create],
  list,
  read: [dishExists, read],
  update: [dishExists, dishValidation, update],
};