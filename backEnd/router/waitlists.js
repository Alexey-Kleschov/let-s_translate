const express = require('express');
const router = express.Router();
const customerModel = require('../models/customer');
const translatorModel = require('../models/translator');
const waitlistModel = require('../models/waitlist');
const orderModel = require('../models/order');

router.post('/accept', async (req, res) => {
  let idOrder = req.body.idOrder;
  let id = req.body.idTranslators;
  
  let waitlistExist = await waitlistModel.findOne({where: {idOrder: idOrder}}).then((result) => {
    if (result) {
      let idTranslator = result.idTranslators;
      idTranslator.push(id);
      idTranslator = [...new Set(idTranslator)];
      result.update({idTranslators: idTranslator});
      res.json({message: 'OK DOBAVLEN'});
    } else {
      let idTranslatorArr = [];
      idTranslatorArr.push(id);
      let waitlist = waitlistModel.create({
        idCustomer: req.body.idCustomer,
        idOrder: req.body.idOrder,
        idTranslators: idTranslatorArr
      });

      res.json({message: 'OK', waitlist});
    }
  })
});

router.get('/:idCustomer', async (req, res) => {
  let idCustomer = req.params.idCustomer;
  let idOrders;
  let idTranslators;

  let orders = await waitlistModel.findAll({where: {idCustomer: idCustomer}}).then((result) => {
    idOrders = result.idOrder;
    idTranslators = result.idTranslators;
  });

  let orderInfo = await orderModel.findOne({where: {id: idOrders}});
  let translator = await translatorModel.findAll({where: {id: idTranslators}});
  res.json({orders, orderInfo, translator});
});

module.exports = router;
