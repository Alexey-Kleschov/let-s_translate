const express = require('express');
const router = express.Router();
const orderModel = require('../models/order');
const customerModel = require('../models/customer');
const tariffModel = require('../models/tariff');
const translatorModel = require('../models/translator');

router.put('/', async(req, res) => {
  let id = req.body.id;
  let price = req.body.price;

  let order = await orderModel.findOne({where: {id: id}}).then((info) => {
    info.update({price: price});
    res.json({info});
  });

});

router.post('/pay', async(req, res) => {
  let id = req.body.id, payment;

  let order = await orderModel.findOne({where: {id: id}}).then((order) => {
    return order;
  });

  let customer = await customerModel.findOne({where: {id: order.idCustomer}}).then((customer) => {
    return {
      tariffName: customer.tariff, 
      coins: customer.coins
    };
  });

  let tariff = await tariffModel.findOne({where: {name: customer.tariffName}}).then((tariff) => {
    let {coeff} = tariff;
    payment = Math.floor(order.price * coeff);
  });

  let data = { coins: order.price - payment };
  let find = { where: {id: order.idCustomer} }

  let updateCustomer = await customerModel.update(data, find);

  let translator = await translatorModel.findOne({where: {id: order.translatorId}}).then((translator) => {
    if(translator === null) {
      res.json({message: 'NO TRANSLATOR'})
    } else {
      let coins = translator.coins;
      let price = order.price;

      translator.update({coins: coins + price});
    }
  });

  let destroy = await orderModel.destroy({where: {id: id}});
  
  res.json({message: 'Transaction is successfully'})
});

module.exports = router;