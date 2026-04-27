import React, { useEffect, useState } from "react";
import clubCategories from "./../main/CategoriesDataClub";

const CategoryModalSub = ({ open, onClose, onSubCategorySelect, mainCategory }) => {
  const [subCategory] = useState(clubCategories);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // 카테고리 열었을 때, 서브카테고리 초기화
  useEffect(() => {
    setSelectedCategories([]);
  }, [open]);

  const handleCategoryClick = (category) => {
    setSelectedCategories((prevCategories) => {
      if (prevCategories.includes(category)) {
        return prevCategories.filter((cat) => cat !== category);
      } else {
        if (prevCategories.length < 2) {
          return [...prevCategories, category];
        }
        return prevCategories;
      }
    });
  };

  const ButtonHandleClick = (event) => {
    const ariaLabel = event.currentTarget.getAttribute("aria-label");
    handleCategoryClick(ariaLabel);
  };

  const handleSelectComplete = () => {
    console.log(selectedCategories);
    onSubCategorySelect(selectedCategories);
    onClose();
  };

  useEffect(() => {
    if (mainCategory && subCategory[mainCategory]) {
      setSubCategoryList(subCategory[mainCategory]);
    }
  }, [mainCategory, subCategory]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      {/* 배경 클릭 시 닫기 */}
      <div
        className="absolute inset-0"
        onClick={() => {
          console.log("Modal closed");
          onClose();
        }}
      />

      <div className="relative z-10 bg-white border-2 border-black shadow-2xl p-8" style={{ width: 800, height: 630 }}>
        <h2 className="text-2xl font-bold text-center">관심사 선택</h2>
        <br />
        <hr className="mb-4" />

        {/* 서브카테고리 버튼 그리드 */}
        <div className="grid grid-cols-6 gap-4">
          {subCategoryList.map((item, index) => (
            <div key={index} className="flex justify-center items-center">
              <button
                aria-label={item}
                onClick={ButtonHandleClick}
                className={`w-[100px] h-[50px] text-base rounded-lg shadow-md transition-colors my-[15px]
                  ${selectedCategories.includes(item) ? "bg-green-600 text-white" : "bg-transparent text-green-600 border border-green-600 hover:bg-green-50"}`}
              >
                {item}
              </button>
            </div>
          ))}
        </div>

        {/* 선택 완료 버튼 */}
        <div className="text-center mt-4">
          <button
            onClick={() => {
              console.log("Button clicked!");
              handleSelectComplete();
            }}
            disabled={selectedCategories.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            선택 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModalSub;
