import React, { useRef, useState, useEffect, useCallback } from "react";
import ImageEditor from "@toast-ui/react-image-editor";
import "tui-image-editor/dist/tui-image-editor.css";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import "./CustomImageEditor.css";
import { FiUpload, FiX } from "react-icons/fi";

const myTheme = {
  "common.bi.image": "",
  "common.bisize.width": "0px",
  "common.bisize.height": "0px",
  "common.backgroundImage": "none",
  "common.backgroundColor": "#fff",
  "common.border": "1px solid #e5e7eb",
};

const GalleryCreate = ({ onRegisterComplete, initialData = {} }) => {
  const editorRef = useRef(null);
  const [title, setTitle] = useState(initialData.title || "");
  const [content, setContent] = useState(initialData.content || "");
  const [selectedImages, setSelectedImages] = useState(initialData.images ? initialData.images.map((url) => ({ url, name: null })) : []);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const fileInputRef = useRef(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const userEmail = useSelector((state) => state.user?.userData?.user?.email || null);

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const loadImage = useCallback(
    async (index) => {
      const editorInstance = editorRef.current?.getInstance();
      if (!editorInstance) return;
      const selectedImage = selectedImages[index];
      if (selectedImage?.url) {
        try {
          await editorInstance.loadImageFromURL(selectedImage.url, "selectedImage");
          editorInstance.clearUndoStack();
          editorInstance.ui.activeMenuEvent();
        } catch (_) {}
      }
    },
    [selectedImages],
  );

  useEffect(() => {
    if (currentImageIndex !== null) loadImage(currentImageIndex);
  }, [currentImageIndex, loadImage]);

  const handleImageUpload = (event) => {
    const files = event.target.files;
    const imagesArray = Array.from(files)
      .slice(0, 8)
      .map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
    setSelectedImages((prev) => {
      const updated = [...prev];
      imagesArray.forEach((img, idx) => {
        if (updated[idx]) updated[idx] = img;
        else updated.push(img);
      });
      return updated;
    });
    setCurrentImageIndex(0);
  };

  const handleBoxClick = async (index) => {
    const editorInstance = editorRef.current?.getInstance();
    if (!editorInstance) return;
    if (currentImageIndex !== null && selectedImages[currentImageIndex]?.url) {
      try {
        const dataURL = editorInstance.toDataURL();
        setSelectedImages((prev) => prev.map((img, idx) => (idx === currentImageIndex ? { ...img, url: dataURL } : img)));
      } catch (_) {}
    }
    setCurrentImageIndex(index);
    const selectedImage = selectedImages[index];
    if (selectedImage?.url) {
      try {
        await editorInstance.loadImageFromURL(selectedImage.url, "selectedImage");
        editorInstance.clearUndoStack();
        editorInstance.ui.activeMenuEvent();
      } catch (_) {
        setSnackbarMessage("이미지 로드 중 오류가 발생했습니다.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };

  const handleSaveAll = async () => {
    const editorInstance = editorRef.current?.getInstance();
    if (editorInstance) {
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        if (image?.url) {
          try {
            await editorInstance.loadImageFromURL(image.url, "selectedImage");
            editorInstance.clearUndoStack();
            editorInstance.ui.activeMenuEvent();
            const dataURL = editorInstance.toDataURL();
            setSelectedImages((prev) => prev.map((img, idx) => (idx === i ? { ...img, url: dataURL } : img)));
          } catch (_) {}
        }
      }
    }

    const formData = new FormData();
    let hasNewFiles = false;

    for (const image of selectedImages) {
      if (image.url && !image.url.startsWith("http")) {
        hasNewFiles = true;
        try {
          const blob = await fetch(image.url).then((r) => r.blob());
          formData.append("files", blob, image.name || "image.jpg");
        } catch (_) {
          return;
        }
      }
    }

    formData.append("writer", userEmail);
    formData.append("title", title);
    formData.append("content", content);

    if (!hasNewFiles) {
      formData.append("sortedImages", JSON.stringify(selectedImages));
    }

    onRegisterComplete(formData);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(selectedImages);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setSelectedImages(reordered);
    setCurrentImageIndex(result.destination.index);
  };

  const imageBoxes = [...selectedImages];
  while (imageBoxes.length < 8) imageBoxes.push({ url: null, name: null });

  return (
    <div className="p-4 sm:p-6">
      {/* 이미지 선택 버튼 */}
      <input type="file" accept="image/*" multiple onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
      <button onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-5 border-2 border-dashed border-primary-300 rounded-xl text-primary-600 hover:bg-primary-50 transition-colors text-sm font-nanum">
        <FiUpload size={16} />
        클릭하여 이미지 선택 (최대 8장)
      </button>

      {/* 에디터 + 사이드바 */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* TOAST UI Image Editor */}
        <div className="w-full lg:w-[60%]">
          <ImageEditor
            ref={editorRef}
            includeUI={{
              theme: myTheme,
              menu: ["crop", "flip", "rotate", "draw", "shape", "icon", "text", "mask", "filter"],
              initMenu: "",
              uiSize: { width: "100%", height: "460px" },
              menuBarPosition: "left",
            }}
            cssMaxHeight={420}
            cssMaxWidth={700}
            selectionStyle={{ cornerSize: 20, rotatingPointOffset: 70 }}
            usageStatistics={false}
            onError={() => {
              setSnackbarMessage("이미지 로드 오류. 다시 시도해주세요.");
              setSnackbarSeverity("error");
              setSnackbarOpen(true);
            }}
          />
        </div>

        {/* 사이드바 */}
        <div className="w-full lg:w-[40%] flex flex-col gap-4">
          {/* 이미지 썸네일 그리드 (드래그로 순서 변경) */}
          <div>
            <p className="text-xs text-gray-400 mb-2">드래그하여 순서 변경 · 클릭하여 편집</p>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="images" direction="horizontal">
                {(provided) => (
                  <div className="grid grid-cols-4 gap-1.5" {...provided.droppableProps} ref={provided.innerRef}>
                    {imageBoxes.map((image, index) => (
                      <Draggable key={index} draggableId={`image-${index}`} index={index}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <div
                              onClick={() => image.url && handleBoxClick(index)}
                              className={`relative w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center transition-all
                                ${currentImageIndex === index ? "ring-2 ring-primary-500 ring-offset-1" : "ring-1 ring-gray-200"}
                                ${snapshot.isDragging ? "opacity-50 scale-95" : ""}
                                ${image.url ? "cursor-pointer hover:opacity-90" : "bg-gray-50 cursor-default"}
                              `}
                            >
                              {image.url ? <img src={image.url} alt={`이미지 ${index + 1}`} className="w-full h-full object-cover" /> : <span className="text-[10px] text-gray-300 select-none">{index + 1}</span>}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">제목</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all" placeholder="제목을 입력해주세요" />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">내용</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 resize-none transition-all" placeholder="내용을 입력해주세요" />
          </div>

          {/* 저장 버튼 */}
          <button onClick={handleSaveAll} className="w-full py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 active:scale-95 transition-all text-sm font-nanum-bold shadow-sm">
            저장
          </button>
        </div>
      </div>

      {/* Snackbar */}
      {snackbarOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${snackbarSeverity === "error" ? "bg-red-500" : "bg-green-500"}`}>
            <span>{snackbarMessage}</span>
            <button onClick={handleSnackbarClose} className="ml-1 hover:opacity-75">
              <FiX size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryCreate;
