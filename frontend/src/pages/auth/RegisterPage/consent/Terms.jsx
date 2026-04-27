import React from "react";
import CustomCheckbox from "../../../../components/club/CustomCheckbox";

const TermsPopup = ({ onClose, handleCheck, checked }) => {
  return (
    <div className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-[600px] max-w-full shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">clubing 이용약관</h2>
        </div>
        <div className="flex flex-col max-h-[60vh] overflow-y-auto p-4">
          <div className="mb-4 flex-grow">
            <div className="box-border rounded border border-[#d6d6d6] p-4 h-[230px] overflow-y-auto bg-[#f9f9f9] text-sm text-gray-700">
              여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을
              작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다.
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <CustomCheckbox checked={checked.terms} onChange={() => handleCheck("terms")} color="primary" />
            <span className="text-sm">약관에 동의합니다.</span>
          </label>
        </div>
        <div className="flex justify-end px-4 py-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsPopup;
