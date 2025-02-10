import React, { useState, useEffect } from "react";
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
import { setupResponseInterceptors } from "./utils/axios.js";
import SnackbarComponent from './SnackbarComponent.js'

const queryClient = new QueryClient();

const Root = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // 스낵바 열기 함수
  const openSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // 스낵바 닫기 함수
  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 응답 인터셉터 설정
  useEffect(() => {
    setupResponseInterceptors(openSnackbar);
  }, []);

  return (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
     {/* 스낵바 컴포넌트 */}
     <SnackbarComponent
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
