import app from "./src/app";
import { config } from "./src/config/config";

const startServer = () => {
    const port = config.port || 8000;

    app.listen(port, () => {
        console.log(`Listening of Port: ${port}`);
    });
};

startServer();
