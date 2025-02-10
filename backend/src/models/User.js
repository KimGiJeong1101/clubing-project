const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");

function arrayLimit(val) {
  return val.length <= 3; // 최대 3개의 값만 허용
}
// 사용자 컬렉션을 위한 스키마 정의
const userSchema = mongoose.Schema({
  registrationMethod: {
    type: Number,
    default: 0, // 회원가입 방법 (0: 자체 회원가입, 1: 카카오, 2: 구글 등)
    required: true, // 회원가입 방법은 필수입니다.
  },
  email: {
    type: String,
    required: true,
    unique: true, // 각 이메일은 고유해야 합니다.
  },
  password: {
    type: String,
    minLength: 8, // 비밀번호는 최소 8자로 바꿔야됌 
  },
  name: {
    type: String,
    required: true, // 이름은 필수입니다.
    maxLength: 20, // 최대 길이 제한이 있습니다.
  },
  nickName: {
    type: String,
    required: true, // 이름은 필수입니다.
    maxLength: 10, // 최대 길이 제한이 있습니다.
  },
  age: {
    type: {
      year: { type: Number }, // 생년
      month: { type: Number }, // 생월
      day: { type: Number }, // 생일
    },
    required: true, // 생년월일은 필수입니다.
  },
  gender: {
    type: String,
    enum: ["남성", "여성"],
    required: true, // 성별은 '남성', '여성' 중 하나여야 합니다.
  },
  profilePic: {
    originalImage: {
      type: String, // 이미지 URL 저장
    },
    thumbnailImage: {
      type: String, // 이미지 URL 저장
    },
    introduction: { // 프로필 소개글
      type: String,
      maxLength: 30, // 최대 500자
    }
  },
  homeLocation: {
    type: {
      city: { type: String }, // 거주지 도시 이름
      district: { type: String }, // 거주지 구/군 이름
      neighborhood: { type: String }, // 거주지 동/읍/면 이름
    },
    required: true, // 거주지 정보는 필수입니다.
  },
  interestLocation: {
    type: {
      city: { type: String }, // 관심 지역 도시 이름
      district: { type: String }, // 관심 지역 구/군 이름
      neighborhood: { type: String }, // 관심 지역 동/읍/면 이름
    },
    required: true, // 관심 지역 정보는 필수입니다.
  },
  workplace: {
    type: {
      city: { type: String }, // 직장 도시 이름
      district: { type: String }, // 직장 구/군 이름
      neighborhood: { type: String }, // 직장 동/읍/면 이름
    },
    required: true, // 직장 정보는 필수입니다.
  },
  category: {
    type: [
      {
        main: { type: String },
        sub: { type: [String] },
      },
    ],
    required: true, // 카테고리 정보는 필수입니다.
  },
  job: {
    type: [String], // 업종 또는 직무 (최대 3개 선택 가능)
    validate: [arrayLimit, "{PATH} exceeds the limit of 3"], // 최대 3개의 값만 허용
  },
  registrationMethod: {
    type: Number,
    default: 0, // 회원가입 방법 (0: 직접, 1: 카카오, 2: 구글 등)
    required: true, // 회원가입 방법은 필수입니다.
  },
  roles: {
    type: Number,
    default: 1, // 사이트 역할 (0: 관리자, 1: 일반 사용자, 2: 프리미엄 사용자 등)
  },
  joinDate: {
    type: Date,
    default: Date.now, // 가입일자 기본값은 현재 날짜입니다.
  },
  phone: {
    type: String,
    required: true,
    match: /^\d{3}-\d{4}-\d{4}$/, // 예: 010-7430-3504
    // 메시지는 해당 유효성 검사의 오류 메시지로 사용됩니다.
  },
  termsAccepted: {
    type: Boolean,
    default: false, // 기본값은 false
  },
  privacyAccepted: {
    type: Boolean,
    default: false, // 기본값은 false
  },
  marketingAccepted: {
    type: Boolean,
    default: false, // 기본값은 false
  },
  history: {//최근 본 모임
    type: Array,
    default: [],
  },
  //회원 탈되시 fale로 두고 가입제한이나 정보 보류? 아니면 30일 뒤에 삭제?
  isActive: {
    type: Boolean,
    default: true, // 기본값은 true, 즉 활성화 상태
  },
  clubs: {
    type: [Number], // 클럽 ID들을 저장하는 배열
    default: [], // 기본값은 빈 배열
  },
  wish: {
    type: [Number], // 클럽 ID들을 저장하는 배열
    default: [], // 기본값은 빈 배열
  },
  invite: {
    type: [Number], // 클럽 ID들을 저장하는 배열
    default: [], // 기본값은 빈 배열
  },
});

userSchema.pre("save", async function (next) {
  let user = this;
  // pre 세이브 전에 호출되는 비밀번호 해싱 미들웨어
  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
  }
  next();
});

// 비밀번호 비교 메서드 추가
userSchema.methods.comparePassword = async function (plainPassword) {
  let user = this;
  const match = await bcrypt.compare(plainPassword, user.password);
  return match;
};

// 사용자 모델 생성
const User = mongoose.model("User", userSchema);

module.exports = User;
