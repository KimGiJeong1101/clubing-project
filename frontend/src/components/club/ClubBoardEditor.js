// frontend/src/components/Club/editorComponent.js
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
  Markdown,
  MediaEmbed,
  Paragraph,
  PasteFromMarkdownExperimental,
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

const categories = ["자유글", "관심사공유", "모임후기", "가입인사", "공지사항(전체알림)", "투표"]; // 카테고리 옵션

export default function CKEditor5Editor({ onChange, title, setTitle, category, setCategory, content, setImage }) {
  const editorContainerRef = useRef(null);
  const editorToolbarRef = useRef(null);
  const editorRef = useRef(null);
  const [editorInstance, setEditorInstance] = useState(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [flag, setFlag] = useState(false);
  // 서버에서 받은 데이터를 기준으로 이미지 링크를 생성할 수 있도록 수정합니다.
  const imgLink = "http://localhost:4000/upload";

  const customUploadAdapter = (loader) => {
    return {
      upload() {
        return new Promise((resolve, reject) => {
          const data = new FormData();
          loader.file.then((file) => {
            data.append("file", file);
            axios
              .post("http://localhost:4000/clubs/boards/upload", data)
              .then((res) => {
                setImage(res.data.filename); // 업로드된 이미지의 파일명 저장
                // dateFolder와 filename을 서버에서 받아오는 것이므로, 여기서 설정할 수 있어야 합니다.
                const dateFolder = getFormattedDate(); // getFormattedDate() 함수가 필요합니다.
                const filename = res.data.filename;
                resolve({ default: `${imgLink}/${dateFolder}/${filename}` }); // 이미지 URL 반환
              })
              .catch((err) => reject(err));
          });
        });
      },
    };
  };

  function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function uploadPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
      return customUploadAdapter(loader);
    };
  }

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  const editorConfig = {
    toolbar: {
      items: ["undo", "redo", "|", "selectAll", "|", "heading", "|", "fontSize", "fontFamily", "fontColor", "fontBackgroundColor", "|", "bold", "italic", "underline", "strikethrough", "code", "|", "specialCharacters", "horizontalLine", "link", "insertImage", "insertTable", "blockQuote", "codeBlock", "|", "alignment", "|", "bulletedList", "numberedList", "todoList", "outdent", "indent", "|", "accessibilityHelp"],
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
  };

  useEffect(() => {
    if (editorInstance) {
      editorInstance.model.document.on("change:data", () => {
        const data = editorInstance.getData();
        onChange(data);
      });
    }
  }, [editorInstance, onChange]);

  return (
    <div className="mb-4">
      {/* Title input */}
      <div className="mb-4">
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#DBC7B5]" />
      </div>

      {/* Category select */}
      <div className="mb-4">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#DBC7B5] bg-white">
          <option value="">Category 선택</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="main-container">
        <div className="editor-container editor-container_document-editor" ref={editorContainerRef}>
          <div className="editor-container__toolbar" ref={editorToolbarRef}></div>
          <div className="editor-container__editor-wrapper">
            <div className="editor-container__editor">
              <div ref={editorRef}>
                {isLayoutReady && (
                  <CKEditor
                    onReady={(editor) => {
                      editorToolbarRef.current.appendChild(editor.ui.view.toolbar.element);
                      setEditorInstance(editor);
                    }}
                    onAfterDestroy={() => {
                      if (editorToolbarRef.current) {
                        Array.from(editorToolbarRef.current.children).forEach((child) => child.remove());
                      }
                    }}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      onChange(data);
                    }}
                    onBlur={(event, editor) => {
                      console.log("Blur.", editor);
                    }}
                    onFocus={(event, editor) => {
                      console.log("Focus.", editor);
                    }}
                    editor={DecoupledEditor}
                    config={{
                      ...editorConfig,
                      extraPlugins: [uploadPlugin], // 수정된 부분
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
