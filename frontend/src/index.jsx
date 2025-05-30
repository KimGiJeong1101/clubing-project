import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider } from "react-redux";
import { store, persistor } from "./store/index.js";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider } from "@mui/material/styles";
import theme, { GlobalStyle } from "./theme"; // 생성한 테마 파일 임포트

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider theme={theme}>
            {" "}
            {/* 테마 적용 */}
            <GlobalStyle /> {/* 전역 스타일 적용 */}
            <App />
          </ThemeProvider>
        </PersistGate>
      </Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </BrowserRouter>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
