import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { toggleFavorite } from '../../store/reducers/wishSlice';
import CustomSnackbarWithTimer from "../auth/Snackbar"; 

const WishHearts = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Redux store에서 상태를 가져옵니다.
    const user = useSelector((state) => state.user.userData.user);
    const favoriteList = useSelector((state) => state.wish.favoriteList);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const clubNumber = Number(queryParams.get("clubNumber")); // URL 파라미터에서 clubNumber를 가져옵니다.

    const [isFavorite, setIsFavorite] = useState(false);
    //스낵바
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const handleSnackbarClose = () => {
        setSnackbarOpen(false); // 스낵바 닫기
      };

    useEffect(() => {
        // favoriteList와 clubNumber를 기반으로 isFavorite 상태 업데이트
        setIsFavorite(favoriteList.includes(clubNumber));
    }, [favoriteList, clubNumber]); // favoriteList와 clubNumber가 변경될 때마다 업데이트

    const handleFavoriteToggle = () => {
        if (user.email === "") {
            alert("로그인이 필요한 서비스입니다.");
            navigate("/login");
            return;
        }

        const url = isFavorite
            ? `/clubs/removeWish/${clubNumber}`
            : `/clubs/addWish/${clubNumber}`;

        axiosInstance.post(url)
            .then(() => {
                // 상태 업데이트
                dispatch(toggleFavorite({ clubNumber }));
                setSnackbarMessage(
                    isFavorite ? "모임의 찜을 해제했습니다." : "모임을 찜했습니다."
                  );
                  setSnackbarSeverity("success");
                  setSnackbarOpen(true); // 스낵바 열기
            })
            .catch((err) => {
                console.log(err);
                setSnackbarMessage("찜하기에 실패했습니다.");
                setSnackbarSeverity("error");
                setSnackbarOpen(true); // 실패 시 스낵바 열기
            });
    };

    const FavoriteComponent = ({ isFavorite, onToggle }) => (
        <FavoriteIcon
            onClick={onToggle}
            sx={{
                fontSize: "26px",
                padding: "7px",
                color: isFavorite ? "lightcoral" : "gray",
                ":hover": {
                    cursor: "pointer",
                },
            }}
        />
    );

    return (
        <>
        <FavoriteComponent 
          isFavorite={isFavorite} 
          onToggle={handleFavoriteToggle} 
        />
        
        {/* 스낵바 컴포넌트 추가 */}
        <CustomSnackbarWithTimer
          open={snackbarOpen}
          message={snackbarMessage}
          severity={snackbarSeverity}
          onClose={handleSnackbarClose}
          duration={5000} // 원하는 시간 동안 스낵바 유지
        />
      </>
    );
  };

export default WishHearts;
