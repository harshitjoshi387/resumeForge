const express = require('express');
const userRouter = require("./router/user.routes");
const documentRouter = require("./router/document.routes");
app.use("/api/documents", documentRouter);
app.use("/api/users", userRouter);

const app = express();

app.use(express.json());

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});