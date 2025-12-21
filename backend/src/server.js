import app from "./app.js";
import connectDB from "./config/mongodb.js";

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
