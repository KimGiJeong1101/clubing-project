import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../../store/actions/userActions";
import axiosInstance from "../../../../utils/axios";
import CustomSnackbar from "../../../../components/auth/Snackbar";

const MyCancelAccount = ({ view }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await axiosInstance.delete("/users/myPage/delete");
      console.log("회원 탈퇴 요청이 전송되었습니다.", response.data);
      setSnackbarMessage("회원 탈퇴가 완료되었습니다.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      setTimeout(async () => {
        try {
          await axiosInstance.post("/users/logout");
          dispatch(logoutUser());
          navigate("/");
        } catch (logoutError) {
          console.error("로그아웃 중 오류 발생:", logoutError);
          setSnackbarMessage("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
      }, 2000);
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      setSnackbarMessage("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };

  const handleDeleteAccount = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col justify-center mx-auto w-full max-w-[600px]">
      <div className="flex flex-col">
        {/* view 상태에 따른 렌더링 */}
        {view === "delete" && (
          <div className="p-6 bg-white rounded-2xl shadow-lg">
            <div className="mt-1 mb-1">
              <p className="text-base text-center mb-8">회원 탈퇴를 진행하시겠습니까?</p>
              <button
                onClick={handleDeleteAccount}
                className="w-full px-4 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                탈퇴하기
              </button>
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-center mb-6">
                정말로 회원 탈퇴를 하시겠습니까?
              </h2>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <button
                  onClick={handleCloseModal}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          </div>
        )}

        <CustomSnackbar open={snackbarOpen} message={snackbarMessage} severity="success" onClose={handleSnackbarClose} />
      </div>
    </div>
  );
};

export default MyCancelAccount;
