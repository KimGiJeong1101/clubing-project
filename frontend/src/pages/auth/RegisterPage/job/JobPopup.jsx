import React, { useState } from "react";
import Draggable from "react-draggable";
import { FiX } from "react-icons/fi";
import CustomButton from "../../../../components/club/CustomButton";
import CustomButton2 from "../../../../components/club/CustomButton2";

const JobPopup = ({ jobCategories, onSelect, onClose, selectedJobs }) => {
  const [localSelectedJobs, setLocalSelectedJobs] = useState(selectedJobs);
  const [error, setError] = useState("");

  const handleSelect = (job) => {
    const isSelected = localSelectedJobs.includes(job);
    if (isSelected) {
      setLocalSelectedJobs((prev) => prev.filter((selectedJob) => selectedJob !== job));
    } else {
      if (localSelectedJobs.length < 3) {
        setLocalSelectedJobs((prev) => [...prev, job]);
        setError("");
      } else {
        setError("최대 3개의 직무만 선택할 수 있습니다.");
      }
    }
  };

  const handleSubmit = () => {
    onSelect(localSelectedJobs);
    onClose();
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1300] bg-black/50 flex items-center justify-center"
      onClick={handleClose}
    >
      <Draggable>
        <div
          className="bg-white p-8 rounded-2xl shadow-2xl w-[90vw] max-w-[600px] max-h-[80vh] overflow-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* X 버튼 */}
          <button
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            onClick={handleClose}
          >
            <FiX size={20} />
          </button>

          <h6 className="text-lg font-semibold mb-3">직무 선택 (최대 3개 선택 가능)</h6>

          {error && (
            <p className="text-red-500 text-sm mb-2">{error}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {jobCategories.map((job) => (
              <CustomButton
                key={job}
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(job);
                }}
                sx={{
                  textTransform: "none",
                  backgroundColor: localSelectedJobs.includes(job) ? "#A67153" : "#DBC7B5",
                  borderColor: "transparent",
                  "&:hover": {
                    backgroundColor: localSelectedJobs.includes(job) ? "#A67153" : "#DBC7B5",
                    borderColor: "transparent",
                  },
                }}
              >
                {job}
              </CustomButton>
            ))}
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <CustomButton2 variant="contained" color="primary" onClick={handleSubmit}>
              확인
            </CustomButton2>
            <CustomButton
              variant="outlined"
              color="secondary"
              onClick={handleClose}
              sx={{
                borderColor: "transparent",
                "&:hover": { borderColor: "transparent" },
              }}
            >
              닫기
            </CustomButton>
          </div>
        </div>
      </Draggable>
    </div>
  );
};

export default JobPopup;
