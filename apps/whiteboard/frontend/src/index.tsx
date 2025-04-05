/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import { Page } from "./page.tsx";

const root = document.getElementById("root");
render(() => <Page />, root!);
