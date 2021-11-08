import "./index.css";

import React from "react";
import ReactDOM from "react-dom";

import App from "./components/controllers/App";
import { RenState } from "./state/renState";

ReactDOM.render(
    <React.StrictMode>
        <RenState.Provider>
            <App />
        </RenState.Provider>
    </React.StrictMode>,
    document.getElementById("root")
);
