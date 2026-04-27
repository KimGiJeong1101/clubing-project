import React, { useState } from "react";
import Draggable from "react-draggable";
import { FiX } from "react-icons/fi";
import CustomButton from "../../../../components/club/CustomButton";
import CustomButton2 from "../../../../components/club/CustomButton2";

const CategoryPopup = ({ categories, onSelect, onClose, selectedCategories }) => {
  const [localSelectedCategories, setLocalSelectedCategories] = useState(selectedCategories);

  const handleSelect = (main, sub) => {
    const isSelected = localSelectedCategories.some((cat) => cat.main === main && cat.sub === sub);
    if (isSelected) {
      setLocalSelectedCategories((prev) => prev.filter((cat) => !(cat.main === main && cat.sub === sub)));
    } else {
      setLocalSelectedCategories((prev) => [...prev, { main, sub }]);
    }
  };

  const handleSubmit = () => {
    onSelect(localSelectedCategories);
    onClose();
  };
  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1300] bg-black/50 flex items-center justify-center" onClick={handleClose}>
      <Draggable>
        <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-[600px] max-h-[80vh] overflow-auto relative p-6" onClick={(e) => e.stopPropagation()}>
          <button className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 transition-colors" onClick={handleClose}>
            <FiX className="w-5 h-5" />
          </button>

          <h3 className="text-lg font-nanum-bold text-gray-800 mb-4">카테고리 선택</h3>

          <div className="p-2 space-y-6">
            {Object.entries(categories).map(([main, subs]) => (
              <div key={main}>
                <h4 className="text-base font-nanum-bold text-gray-700 mb-3">{main}</h4>
                <div className="flex flex-wrap gap-2">
                  {subs.map((sub) => {
                    const isActive = localSelectedCategories.some((cat) => cat.main === main && cat.sub === sub);
                    return (
                      <button
                        key={sub}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(main, sub);
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isActive ? "bg-primary-600 text-white" : "bg-primary-50 text-primary-700 hover:bg-primary-100"}`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="sticky bottom-0 bg-white pt-3 flex justify-end gap-2">
            <CustomButton2 onClick={handleSubmit}>확인</CustomButton2>
            <CustomButton onClick={handleClose}>닫기</CustomButton>
          </div>
        </div>
      </Draggable>
    </div>
  );
};

export default CategoryPopup;
