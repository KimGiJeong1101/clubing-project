// theme.js
import { createTheme } from "@mui/material/styles";
import { GlobalStyles } from "@mui/material";
import { margin } from "@mui/system";

const theme = createTheme({
  typography: {
    fontFamily: "NanumSquareNeoBold, NanumSquareNeoExtraBold, KCC-Hanbit", // 공통 글씨체 설정
  },
  // 추가적인 테마 설정이 필요할 경우 여기에 작성
});

// GlobalStyles를 사용하여 body 스타일을 적용
export const GlobalStyle = () => (
  <GlobalStyles
    styles={{
      body: {
        margin: "0px !important",
        padding: "0px !important",
        fontFamily: "KCC-Hanbit",
        backgroundColor: "white" /* 페이지 배경 색상 설정 */,  //"#F0F0F0"
      },
    }}
  />
);

export default theme;
