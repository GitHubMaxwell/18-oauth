'use strict';

const express = require('express');
// import express from 'express';

const app = express();
const PORT = 8080;

app.use(express.static('./public'));

app.listen(PORT, () => {
  console.log('Web Server up on port', PORT);
});