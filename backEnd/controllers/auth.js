const bcypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const translatorModel = require('../models/translator');
const customerModel = require('../models/customer');
const { jwtSecret } = require('../configs/jwt');

const login = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const role = req.body.role;
  
  switch(role) {
    case 'customer': 
      customer();
      break;
    case 'translator':
      translator();
      break;
    default:
      res.json({message: "ERROR BLYAT"})
  }

  function customer() {
    customerModel.findOne({where: {email: email}}).then((customer) => {
      if(!customer) res.status(401).json({message: 'User does not exist!'})

      const isValid = bcypt.compareSync(password, customer.password);
      if(isValid) {
        const token = jwt.sign(customer.id.toString(), jwtSecret);
        res.json({ token })
      } else {
        res.status(401).json({message: 'Invalid credentias!'})
      }
    }).catch(err => res.status(500).json({message: err.message}));
  }

  function translator() {
    translatorModel.findOne({where: {email: email}}).then((translator) => {
      if(!translator) res.status(401).json({message: 'User does not exist!'})

      const isValid = bcypt.compareSync(password, translator.password);
      if(isValid) {
        const token = jwt.sign(translator.id.toString(), jwtSecret);
        res.json({ token })
      } else {
        res.status(401).json({message: 'Invalid credentias!'})
      }
    }).catch(err => res.status(500).json({message: err.message}));
  }

}

module.exports = { login };