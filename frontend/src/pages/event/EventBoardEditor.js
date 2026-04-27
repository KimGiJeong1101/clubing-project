import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  DecoupledEditor,
  AccessibilityHelp,
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  Autosave,
  BalloonToolbar,
  BlockQuote,
  BlockToolbar,
  Bold,
  CloudServices,
  Code,
  CodeBlock,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  HorizontalLine,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  SelectAll,
  SimpleUploadAdapter,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  Undo,
} from "ckeditor5";
import translations from "ckeditor5/translations/ko.js";
import "ckeditor5/ckeditor5.css";
// import "../../assets/styles/ClubBoard.css"; 이 부분 지워도 됨. 파일 비어져 있길래 지웠는데, 임포트 찾을 수 없다고 에러나서 일단 주석
import "./EditorStyle.css";

export default function CKEditor5Editor({ onChange, title, setTitle, content, setImage }) {
  const editorContainerRef = useRef(null);
  const editorToolbarRef = useRef(null);
  const editorRef = useRef(null);
  const [editorInstance, setEditorInstance] = useState(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const imgLink = "http://localhost:4000/upload";

  // 커스텀 업로드 어댑터 정의
  const customUploadAdapter = (loader) => {
    return {
      upload() {
        return new Promise((resolve, reject) => {
          const data = new FormData();
          loader.file.then((file) => {
            data.append("file", file);
            axios
              .post("http://localhost:4000/events/upload", data)
              .then((res) => {
                setImage(res.data.filename); // 업로드된 파일 이름 저장
                const dateFolder = getFormattedDate();
                const filename = res.data.filename;
                resolve({ default: `${imgLink}/${dateFolder}/${filename}` }); // 이미지 경로 반환
              })
              .catch((err) => reject(err)); // 오류 처리
          });
        });
      },
    };
  };

  // 현재 날짜를 yyyy-mm-dd 형식으로 반환하는 함수
  function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // 업로드 플러그인 추가
  function uploadPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
      return customUploadAdapter(loader); // 파일 업로드 어댑터 연결
    };
  }

  // 레이아웃 준비 상태 업데이트
  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  const editorConfig = {
    toolbar: {
      items: ["undo", "redo", "|", "selectAll", "|", "heading", "|", "fontSize", "fontFamily", "fontColor", "fontBackgroundColor", "|", "bold", "italic", "underline", "strikethrough", "code", "|", "specialCharacters", "horizontalLine", "link", "insertImage", "mediaEmbed", "insertTable", "blockQuote", "codeBlock", "|", "alignment", "|", "bulletedList", "numberedList", "todoList", "outdent", "indent", "|", "accessibilityHelp"],
      shouldNotGroupWhenFull: false,
    },
    plugins: [
      AccessibilityHelp,
      Alignment,
      Autoformat,
      AutoImage,
      AutoLink,
      Autosave,
      BalloonToolbar,
      BlockQuote,
      BlockToolbar,
      Bold,
      CloudServices,
      Code,
      CodeBlock,
      Essentials,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      Heading,
      HorizontalLine,
      Image,
      ImageBlock,
      ImageCaption,
      ImageInline,
      ImageInsert,
      ImageInsertViaUrl,
      ImageResize,
      ImageStyle,
      ImageTextAlternative,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      Italic,
      Link,
      LinkImage,
      List,
      ListProperties,
      MediaEmbed,
      Paragraph,
      PasteFromOffice,
      SelectAll,
      SimpleUploadAdapter,
      SpecialCharacters,
      SpecialCharactersArrows,
      SpecialCharactersCurrency,
      SpecialCharactersEssentials,
      SpecialCharactersLatin,
      SpecialCharactersMathematical,
      SpecialCharactersText,
      Strikethrough,
      Table,
      TableCaption,
      TableCellProperties,
      TableColumnResize,
      TableProperties,
      TableToolbar,
      TextTransformation,
      TodoList,
      Underline,
      Undo,
      uploadPlugin,
    ],
    balloonToolbar: ["bold", "italic", "|", "link", "insertImage", "|", "bulletedList", "numberedList"],
    blockToolbar: ["fontSize", "fontColor", "fontBackgroundColor", "|", "bold", "italic", "|", "link", "insertImage", "insertTable", "|", "bulletedList", "numberedList", "outdent", "indent"],
    fontFamily: {
      supportAllValues: true,
    },
    fontSize: {
      options: [10, 12, 14, "default", 18, 20, 22],
      supportAllValues: true,
    },
    heading: {
      options: [
        { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
        { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
        { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
        { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
        { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
        { model: "heading5", view: "h5", title: "Heading 5", class: "ck-heading_heading5" },
        { model: "heading6", view: "h6", title: "Heading 6", class: "ck-heading_heading6" },
      ],
    },

    image: {
      toolbar: ["toggleImageCaption", "imageTextAlternative", "|", "imageStyle:inline", "imageStyle:wrapText", "imageStyle:breakText", "|", "resizeImage"],
    },
    initialData: content || "", // 기본값을 빈 문자열로 설정
    language: "ko",
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: "https://",
      decorators: {
        toggleDownloadable: {
          mode: "manual",
          label: "Downloadable",
          attributes: {
            download: "file",
          },
        },
      },
    },
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true,
      },
    },
    placeholder: "내용을 입력해주세요😆",
    table: {
      contentToolbar: ["tableColumn", "tableRow", "mergeTableCells", "tableProperties", "tableCellProperties"],
    },
    translations: [translations],
    height: 300, // 에디터의 고정 높이 설정
  };

  // 에디터 인스턴스가 변경되면 데이터를 업데이트
  useEffect(() => {
    if (editorInstance) {
      editorInstance.model.document.on("change:data", () => {
        const data = editorInstance.getData();
        onChange(data); // 상위 컴포넌트로 데이터 전달
      });
    }
  }, [editorInstance, onChange]);

  return (
    <div
      className="mb-4 p-5 rounded-2xl shadow-md"
      style={{
        border: "3px solid transparent",
        borderImage: "linear-gradient(45deg, #6a82fb, #fc5c7d) 1",
      }}
    >
      {/* 제목 입력 필드 */}
      <div className="mb-2 mt-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력해주세요" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6a82fb]" />
      </div>
      <div className="main-container" style={{ width: "100%" }}>
        <div className="editor-container editor-container_document-editor" ref={editorContainerRef}>
          <div className="editor-container__toolbar" ref={editorToolbarRef}></div>
          <div className="editor-container__editor-wrapper" style={{ width: "100%", height: "100%" }}>
            <div className="editor-container__editor" style={{ width: "100%", height: "100%" }}>
              {isLayoutReady && (
                <CKEditor
                  onReady={(editor) => {
                    editorToolbarRef.current.appendChild(editor.ui.view.toolbar.element); // 툴바 설정
                    setEditorInstance(editor); // 에디터 인스턴스 저장
                  }}
                  editor={DecoupledEditor}
                  config={editorConfig}
                  data={content || ""}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
