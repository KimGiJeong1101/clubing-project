import React, { useState } from "react";
import { FiPhone } from "react-icons/fi";
import Modal from "../../../components/common/Modal";
import axiosInstance from "../../../utils/axios";

const maskEmail = (email) => {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.slice(0, 4)}****@${domain}`;
};

const formatPhone = (v) => {
  const n = v.replace(/\D/g, "");
  if (n.length <= 3) return n;
  if (n.length <= 7) return `${n.slice(0, 3)}-${n.slice(3)}`;
  return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7, 11)}`;
};

const FindEmailPage = ({ open, onClose }) => {
  const [phone, setPhone] = useState("");
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState("");

  const handleFind = async () => {
    try {
      const res = await axiosInstance.post("/users/findEmail", { phone });
      setEmails([res.data.email]);
      setError("");
    } catch (e) {
      if (e.response?.status === 404) {
        setError("전화번호로 조회되는 아이디가 없습니다.");
        setEmails([]);
      } else {
        setError("오류가 발생했습니다.");
      }
    }
  };

  const handleClose = () => {
    setPhone("");
    setEmails([]);
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="아이디 찾기">
      <div className="space-y-4">
        <div className="relative">
          <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input className="input-base pl-9" placeholder="전화번호 (예: 010-1234-5678)" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} onKeyDown={(e) => e.key === "Enter" && handleFind()} maxLength={13} />
        </div>

        {emails.length > 0 && (
          <div className="bg-primary-50 rounded-lg px-4 py-3">
            <p className="text-sm font-nanum-bold text-gray-700 mb-1">조회된 이메일:</p>
            {emails.map((e, i) => (
              <p key={i} className="text-sm text-primary-700 font-semibold">
                {maskEmail(e)}
              </p>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button onClick={handleFind} className="btn-primary flex-1">
            조회
          </button>
          <button onClick={handleClose} className="btn-outline flex-1">
            닫기
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FindEmailPage;
