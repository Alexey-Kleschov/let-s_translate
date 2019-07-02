const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.static('./public/uploads'));
app.use(cors());
app.use(urlencodedParser);
app.use(bodyParser.json());
//***************************************************************** */

const Sequelize = require("sequelize");
const sequelize = new Sequelize("test1", "postgres", "1", {
  dialect: "postgres"
});

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  age: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
});
sequelize.sync().then(result => {
  console.log(result);
})
  .catch(err => console.log(err));

//********************************************************************* */
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({error: err});
})

app.listen(3000, () => {
  console.log('server started');
})
