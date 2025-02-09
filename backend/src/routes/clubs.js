const express = require("express");
const Club = require("../models/Club");
const Meeting = require("../models/Meeting");
const auth = require("../middleware/auth");
const router = express.Router();
const multer = require("multer");
const path = require("path"); // path 모듈을 불러옵니다.
const fs = require("fs");
const { v4: uuidv4 } = require("uuid"); // uuid v4 방식 사용
const User = require("../models/User");

// ======================================연코드=========================================================================
router.get("/card", async (req, res, next) => {
  try {
    console.log("클럽 목록 가져오기 시작");
    const clubs = await Club.find().sort({ _id: -1 }); // 오름차순으로 정렬
    console.log("클럽 목록 가져오기 완료", clubs);

    const clubsWithImages = await Promise.all(
      clubs.map(async (club) => {
        // 관리자 이미지 가져오기
        const admin = club.admin; // 클럽의 admin 필드를 가져옴
        const adminData = await User.findOne({ email: admin });
        const adminImage = adminData?.profilePic?.thumbnailImage || null;

        // 멤버 이미지 가져오기
        const memberImages = await Promise.all(
          club.members.map(async (memberEmail) => {
            const memberData = await User.findOne({ email: memberEmail });
            return memberData?.profilePic?.thumbnailImage || null;
          }),
        );

        // 클럽 데이터에 adminImage와 memberImages 추가
        return {
          ...club.toObject(), // 클럽 데이터를 객체로 변환
          adminImage,
          memberImages,
        };
      }),
    );

    // 클럽 데이터와 관리자/멤버 이미지 데이터를 함께 응답
    res.status(200).json(clubsWithImages);
  } catch (error) {
    console.error("클럽 목록 가져오기 실패", error);
    next(error);
  }
});
// ======================================연코드.end=========================================================================
//리스트 보여주기
router.get("/", async (req, res, next) => {
  try {
    if (req.query.searchRegion) {
      const clubs = await Club.find({ "region.district": req.query.searchRegion }).sort({ _id: -1 }).limit(6); // 오름차순 솔팅
      await memberInfoInsert(clubs);
      res.status(200).json(clubs);
    } else {
      const clubs = await Club.find().sort({ _id: -1 }).limit(6); // 오름차순 솔팅
      await memberInfoInsert(clubs);

      res.status(200).json(clubs);
    }
  } catch (error) {
    next(error);
  }
});
router.get("/:category", async (req, res, next) => {
  try {
    if (req.query.searchRegion) {
      const clubs = await Club.find({ mainCategory: req.params.category, "region.district": req.query.searchRegion }).sort({ _id: -1 }).limit(6); // 오름차순 솔팅
      await memberInfoInsert(clubs);
      res.status(200).json(clubs);
    } else {
      const clubs = await Club.find({ mainCategory: req.params.category }).sort({ _id: -1 }).limit(6); // 오름차순 솔팅
      await memberInfoInsert(clubs);
      res.status(200).json(clubs);
    }
  } catch (error) {
    next(error);
  }
});
router.get("/scroll/:scrollCount/:category", async (req, res, next) => {
  try {
    const skip = (req.params.scrollCount - 1) * 6;
    if (req.query.searchRegion) {
      const clubs = await Club.find({ mainCategory: req.params.category, "region.district": req.query.searchRegion }).sort({ _id: -1 }).skip(skip).limit(6); // 오름차순 솔팅
      await memberInfoInsert(clubs);
      res.status(200).json(clubs);
    } else {
      const clubs = await Club.find({ mainCategory: req.params.category }).sort({ _id: -1 }).skip(skip).limit(6); // 오름차순 솔팅
      await memberInfoInsert(clubs);
      res.status(200).json(clubs);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/scroll/:scrollCount", async (req, res, next) => {
  try {
    const skip = (req.params.scrollCount - 1) * 6;

    if (req.query.searchRegion) {
      const clubs = await Club.find({ "region.district": req.query.searchRegion }).sort({ _id: -1 }).skip(skip).limit(6); // 오름차순 솔팅
      await memberInfoInsert(clubs);
      res.status(200).json(clubs);
    } else {
      const clubs = await Club.find().sort({ _id: -1 }).skip(skip).limit(6); // 오름차순 솔팅
      await memberInfoInsert(clubs);
      res.status(200).json(clubs);
    }
  } catch (error) {
    next(error);
  }
});

router.use("/clubs", express.static(path.join(__dirname, "clubs")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "clubs/";

    // 폴더가 존재하지 않으면 생성
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4() + "-" + Date.now(); // UUID와 현재 시간 조합
    const fileExtension = path.extname(file.originalname); // 원본 파일 확장자 가져오기
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`); // 필드명-UUID-시간.확장자
  },
});

const upload = multer({ storage: storage });

// 파일 업로드 엔드포인트
router.post("/create", auth, upload.single("img"), async (req, res, next) => {
  try {
    const club2 = req.body;
    club2.admin = req.user.email;
    club2.img = req.file.destination + req.file.filename;
    club2.adminNickName = req.user.nickName;
    club2.members = [req.user.email];

    if (req.body.subCategory) {
      req.body.subCategory = req.body.subCategory.split(",");
    }

    // 클럽 생성
    const club = new Club(req.body);
    const savedClub = await club.save(); // 저장된 클럽을 변수에 저장

    // 클럽 생성 시 유저에 클럽넘버 추가
    await User.findOneAndUpdate(
      { email: req.user.email }, // 이메일로 유저를 찾음
      { $addToSet: { clubs: savedClub._id } }, // 유저의 클럽 목록에 클럽 ID 추가
      { new: true }, // 업데이트된 문서를 반환하도록 설정
    );

    res.status(200).json({ message: "클럽 생성 완료" });
  } catch (error) {
    next(error);
  }
});

//클럽 보여주기(GET)
router.get("/read/:id", async (req, res, next) => {
  try {
    const clubs = await Club.findById({ _id: req.params.id });

    res.status(200).json(clubs);
  } catch (error) {
    next(error);
  }
});

//클럽 보여주기(수정 , GET)

router.get("/read2/:id", async (req, res, next) => {
  try {
    const clubs = await Club.findById({ _id: req.params.id });
    const meetings = await Meeting.find({ clubNumber: req.params.id });
    clubs.meeting = meetings;

    const memberInfo = [];
    for (let i = 0; i < clubs.members.length; i++) {
      let copymember = { thumbnailImage: "", name: "", nickName: "" };
      const userinfo = await User.findOne({ email: clubs.members[i] });
      copymember.name = userinfo.name;
      copymember.nickName = userinfo.nickName;
      copymember.thumbnailImage = userinfo.profilePic.thumbnailImage;
      memberInfo.push(copymember);
    }
    //찜하기 회원 목록
    const wishInfo = [];
      for (let i = 0; i < clubs.wishHeart.length; i++) {
          let copymember = { email: "", name: "", nickName: "", thumbnailImage: "", wish: "", invite: "",};
          // 이메일로 사용자 정보 조회
          const userinfo = await User.findOne({ email: clubs.wishHeart[i] });
          copymember.email = userinfo.email;
          copymember.name = userinfo.name;
          copymember.nickName = userinfo.nickName;
          copymember.thumbnailImage = userinfo.profilePic.thumbnailImage;
          copymember.wish = userinfo.wish;
          copymember.invite = userinfo.invite;
          wishInfo.push(copymember);
      }

    let copy = { ...clubs._doc, clubmembers: memberInfo, wishmembers: wishInfo };
    res.status(200).json(copy);
  } catch (error) {
    next(error);
  }
});

router.delete("/delete/:id", auth, async (req, res, next) => {
  try {
    const clubs = await Club.findByIdAndDelete({ _id: req.params.id });

    //클럽 삭제 시 유저에 저장된 정보도 지움 
    const clubId = req.params.id;
    await User.updateMany(
      { clubs: clubId }, // 클럽 목록에 삭제된 클럽 ID가 포함된 유저를 찾음
      { $pull: { clubs: clubId, wish: clubId } }, // 유저의 클럽 목록에서 클럽 ID 제거
    );

    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/update/:clubNumber", auth, upload.single("img"), async (req, res, next) => {
  try {
    req.body.img = req.file.destination + req.file.filename;

    const updatedClub = await Club.findByIdAndUpdate(
      req.params.clubNumber,
      req.body,
      { new: true }, // 업데이트 후 새 객체를 반환
    );
    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/update2/:clubNumber", auth, async (req, res, next) => {
  try {
    const updatedClub = await Club.findByIdAndUpdate(
      req.params.clubNumber,
      req.body,
      { new: true }, // 업데이트 후 새 객체를 반환
    );
    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/addMember/:clubNumber", auth, async (req, res, next) => {
  try {
    const clubs = await Club.findById({ _id: req.params.clubNumber });
    clubs.members.push(req.user.email);
    clubs.save();

    // 유저 정보에 클럽 ID 추가 (중복 방지) 9.9 hyk 추가
    await User.findOneAndUpdate(
      { email: req.user.email }, // 이메일로 유저를 찾음
      { $addToSet: { clubs: req.params.clubNumber } }, // 유저의 클럽 목록에 클럽 ID 추가
      { new: true }, // 업데이트된 문서를 반환하도록 설정
    );

    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/cencellMember/:clubNumber", auth, async (req, res, next) => {
  try {
    const clubs = await Club.findById({ _id: req.params.clubNumber });
    const memberIndex = clubs.members.indexOf(req.user.email);

    //유저에서 클럽
    const user = await User.findOne({ email: req.user.email });
    const clubIndex = user.clubs.indexOf(req.params.clubNumber);
    clubs.members.splice(memberIndex, 1);

    user.clubs.splice(clubIndex, 1);
    clubs.save();
    user.save();
    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

//카테고리로 같이 연관된 모임 추천해주려고
router.get("/category/:category", async (req, res, next) => {
  try {
    const categoryClubList = await Club.find({
      mainCategory: req.params.category,
    });
    return res.status(200).json(categoryClubList);
  } catch (error) {
    next(error);
  }
});
router.post("/membersInfo", async (req, res, next) => {
  try {
    const memberInfo = [];
    for (let i = 0; i < req.body.length; i++) {
      let copymember = { thumbnailImage: "", name: "", nickName: "" };
      const userinfo = await User.findOne({ email: req.body[i] });
      copymember.name = userinfo.name;
      copymember.nickName = userinfo.nickName;
      copymember.thumbnailImage = userinfo.profilePic.thumbnailImage;
      memberInfo.push(copymember);
    }
    return res.status(200).json(memberInfo);
  } catch (error) {
    next(error);
  }
});
router.post("/deleteMember/:nickName/:clubNumber", async (req, res, next) => {
  try {
    let club = await Club.findById(req.params.clubNumber);
    const userinfo = await User.findOne({ nickName: req.params.nickName });

    const indexToRemove = club.members.indexOf(userinfo.email);
    if (indexToRemove !== -1) {
      club.members.splice(indexToRemove, 1);
      await club.save();
      return res.status(200).json("성공");
    } else {
      return res.status(500).json("실패");
    }
  } catch (error) {
    next(error);
  }
});

router.post("/mandateManager/:nickName/:clubNumber", async (req, res, next) => {
  try {
    let club = await Club.findById(req.params.clubNumber);
    const userinfo = await User.findOne({ nickName: req.params.nickName });
    if (club.manager) {
      if (club.manager.includes(userinfo.email)) {
        return res.status(200).json("이미 있음");
      } else {
        club.manager.push(userinfo.email);
        await club.save();
        return res.status(200).json("성공");
      }
    }
    club.manager.push(userinfo.email);
    await club.save();
    return res.status(200).json("성공");
  } catch (error) {
    next(error);
  }
});
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//찜하기
router.post("/addWish/:clubNumber", auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    const club = await Club.findById(req.params.clubNumber);
    if (!club) {
      return res.status(404).json({ error: "클럽을 찾을 수 없습니다." });
    }

    // 클럽의 찜한 유저 목록에 유저 이메일 추가
    await Club.findOneAndUpdate(
      { _id: req.params.clubNumber },
      { $addToSet: { wishHeart: req.user.email } }, // 유저 이메일 추가
      { new: true },
    );

    // 유저의 찜 목록에도 클럽 ID 추가
    await User.findOneAndUpdate({ email: req.user.email }, { $addToSet: { wish: req.params.clubNumber } }, { new: true });

    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

//찜하기 해제
router.post("/removeWish/:clubNumber", auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    const club = await Club.findById(req.params.clubNumber);
    if (!club) {
      return res.status(404).json({ error: "클럽을 찾을 수 없습니다." });
    }

    // 클럽의 찜한 유저 목록에서 유저 이메일 제거
    await Club.findOneAndUpdate({ _id: req.params.clubNumber }, { $pull: { wishHeart: req.user.email } }, { new: true });

    // 유저의 찜 목록에서도 클럽 ID 제거
    await User.findOneAndUpdate({ email: req.user.email }, { $pull: { wish: req.params.clubNumber } }, { new: true });

    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});
//=============================================================================================================================

//초대하기
router.post("/invite/:clubNumber", auth, async (req, res, next) => {
  console.log("클럽 번호:", req.params.clubNumber);
  console.log("초대할 이메일:", req.body.email); 

  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    const club = await Club.findById(req.params.clubNumber);
    if (!club) {
      return res.status(404).json({ error: "클럽을 찾을 수 없습니다." });
    }

    // 유저의 초대 목록에 클럽 ID 추가
    await User.findOneAndUpdate(
      { email: req.body.email }, 
      { $addToSet: { invite: req.params.clubNumber } }, 
      { new: true }
    );

    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

///////////////////////////추천 모임&검색///////////////////////////
//추천 모임 (리스트)
router.get('/recommend/scroll/:pageParam', async (req, res) => {
  try {
    const { pageParam } = req.params;
    const page = parseInt(pageParam, 10);
    const limit = 6;
    const skip = (page - 1) * limit;

    // 유저 정보를 가져오는 부분
    let user = null;

    if (req.query.email) {
      user = await User.findOne({ email: req.query.email });
    }

    let clubs;

    if (!user) {
      // 유저 정보가 없을 때 모든 클럽을 조회
      clubs = await Club.find().sort({ _id: -1 }).skip(skip).limit(limit);
    } else {
      // 유저 정보가 있을 때 필터링 및 정렬
      const { homeLocation, interestLocation, workplace, category, job } = user;

      // 지역 필터링 순서: neighborhood -> district -> city
      const regions = [homeLocation, interestLocation, workplace].filter(Boolean);

      let regionFilters = [];
      for (const region of regions) {
        regionFilters.push({
          $or: [
            { 'region.neighborhood': region.neighborhood },
            { 'region.district': region.district },
            { 'region.city': region.city }
          ]
        });
      }

      // 선호 정보 필터링 순서: subCategory -> mainCategory
      let categoryFilters = [];
      if (category) {
        categoryFilters = category.flatMap(cat => [
          { 'subCategory': { $in: cat.sub } },
          { 'mainCategory': cat.main }
        ]);
      }

      // 필터 조건을 합친다
      const filterConditions = {
        $and: [
          { $or: regionFilters },
          { $or: categoryFilters },
          { $or: [{ 'job': { $in: job } }, { 'job': { $exists: false } }] }
        ]
      };

      // 클럽을 필터링하고 정렬하기 위한 집계 파이프라인
      clubs = await Club.aggregate([
        { $match: filterConditions },
        {
          $addFields: {
            regionScore: {
              $cond: [
                { $eq: ["$region.neighborhood", homeLocation.neighborhood] }, 0,
                { $cond: [
                  { $eq: ["$region.district", homeLocation.district] }, 1,
                  { $cond: [
                    { $eq: ["$region.city", homeLocation.city] }, 2,
                    3
                  ]}
                ]}
              ]
            },
            categoryScore: {
              $cond: [
                { $in: ["$subCategory", category.flatMap(cat => cat.sub)] }, 0,
                { $cond: [
                  { $eq: ["$mainCategory", category.find(cat => cat.sub.includes("$subCategory"))?.main] }, 1,
                  2
                ]}
              ]
            }
          }
        },
        { $sort: { categoryScore: 1, regionScore: 1 } },
        { $skip: skip },
        { $limit: limit }
      ]);
    }

    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//검색 (헤더에 모임이름으로 검색)  =>> 왜 안되는 거야??
// router.get("/search", async (req, res, next) => {
//   console.log("검색 요청 수신:", req.query.title);
//   try {
//     const { title } = req.query; // 클라이언트에서 받은 검색어

//     // 제목으로 검색 (검색어가 포함된 클럽 찾기)
//     const clubs = await Club.find(
//       { title: { $regex: title, $options: 'i' } }, // 대소문자 구분 없이 검색
//       { _id: 1, title: 1 } // _id와 title만 가져옴
//     )
//     .sort({ _id: -1 }) // _id가 큰 순서로 정렬
//     .limit(10); // 최대 10개 결과 반환

//     res.status(200).json(clubs);
//   } catch (error) {
//     console.error("제목으로 검색 데이터 가져오기 실패", error);
//     next(error);
//   }
// });

//검색 테스트 (헤더에 모임이름으로 검색)
router.get("/search/test", async (req, res, next) => {
  // console.log("검색 요청 수신:", req.query.title);
  try {
    const { title } = req.query; // 클라이언트에서 받은 검색어

    // 제목으로 검색 (검색어가 포함된 클럽 찾기)
    const clubs = await Club.find(
      { title: { $regex: title, $options: 'i' } }, // 대소문자 구분 없이 검색
      { _id: 1, title: 1 } // _id와 title만 가져옴
    )
    .sort({ _id: -1 }) // _id가 큰 순서로 정렬
    .limit(10); // 최대 10개 결과 반환

    res.status(200).json(clubs);
  } catch (error) {
    console.error("제목으로 검색 데이터 가져오기 실패", error);
    next(error);
  }
});

//메인 페이지 (모임 찾기)
router.get("/home/card", async (req, res, next) => {
  try {
    // console.log("클럽 목록 가져오기 시작");
    const clubs = await Club.find(); // 모든 클럽 가져오기
    // console.log("클럽 목록 가져오기 완료", clubs);
    
    // 배열을 랜덤으로 섞기
    const shuffledClubs = clubs.sort(() => 0.5 - Math.random()).slice(0, 4); // 4개의 클럽만 가져오기

    const clubsWithImages = await Promise.all(
      shuffledClubs.map(async (club) => {
        const admin = club.admin;
        const adminData = await User.findOne({ email: admin });
        const adminImage = adminData?.profilePic?.thumbnailImage || null;

        const memberImages = await Promise.all(
          club.members.map(async (memberEmail) => {
            const memberData = await User.findOne({ email: memberEmail });
            return memberData?.profilePic?.thumbnailImage || null;
          }),
        );

        return {
          ...club.toObject(), // 여기서 toObject() 사용
          adminImage,
          memberImages,
        };
      }),
    );

    res.status(200).json(clubsWithImages);
  } catch (error) {
    console.error("클럽 목록 가져오기 실패", error);
    next(error);
  }
});



//메인 페이지 (신규모임)
router.get("/home/card/new", async (req, res, next) => {
  try {
    // console.log("신규 모임 목록 가져오기 시작");
    const clubs = await Club.find().sort({ _id: -1 }).limit(10); // 4개의 클럽만 가져오기
    // console.log("신규 모임 목록 가져오기 완료", clubs);
    
    // 나머지 로직은 동일하게 유지
    const clubsWithImages = await Promise.all(
      clubs.map(async (club) => {
        const admin = club.admin;
        const adminData = await User.findOne({ email: admin });
        const adminImage = adminData?.profilePic?.thumbnailImage || null;

        const memberImages = await Promise.all(
          club.members.map(async (memberEmail) => {
            const memberData = await User.findOne({ email: memberEmail });
            return memberData?.profilePic?.thumbnailImage || null;
          }),
        );

        return {
          ...club.toObject(),
          adminImage,
          memberImages,
        };
      }),
    );

    res.status(200).json(clubsWithImages);
  } catch (error) {
    console.error("신규 모임 목록 가져오기 실패", error);
    next(error);
  }
});

//메인 페이지 (추천 모임)
router.get('/home/recommend', async (req, res) => {
  try {
    let user = null;

    // if (req.query.email) {
    //   user = await User.findOne({ email: req.query.email });
    //   console.log(user)
    // }

    if (req.query.email) {
      user = await User.findOne({ email: req.query.email });
      //console.log("User found:", user);
    } else {
      console.log("No email provided in query.");
    }

    let clubs;

    if (!user || user === 'null') {
      // 유저 정보가 없을 때 모든 클럽을 조회
      clubs = await Club.find().sort({ _id: -1 }).limit(4);
      console.log("Clubs retrieved:", clubs);
    } else {
      // 유저 정보가 있을 때 필터링 및 정렬
      const { homeLocation, interestLocation, workplace, category, job } = user;

      const regions = [homeLocation, interestLocation, workplace].filter(Boolean);
      let regionFilters = regions.map(region => ({
        $or: [
          { 'region.neighborhood': region.neighborhood },
          { 'region.district': region.district },
          { 'region.city': region.city }
        ]
      }));

      let categoryFilters = [];
      if (category) {
        categoryFilters = category.flatMap(cat => [
          { 'subCategory': { $in: cat.sub } },
          { 'mainCategory': cat.main }
        ]);
      }

      const filterConditions = {
        $and: [
          { $or: regionFilters },
          { $or: categoryFilters },
          { $or: [{ 'job': { $in: job } }, { 'job': { $exists: false } }] }
        ]
      };

      clubs = await Club.aggregate([
        { $match: filterConditions },
        {
          $addFields: {
            regionScore: {
              $cond: [
                { $eq: ["$region.neighborhood", homeLocation.neighborhood] }, 0,
                { $cond: [
                  { $eq: ["$region.district", homeLocation.district] }, 1,
                  { $cond: [
                    { $eq: ["$region.city", homeLocation.city] }, 2,
                    3
                  ]}
                ]}
              ]
            },
            categoryScore: {
              $cond: [
                { $in: ["$subCategory", category.flatMap(cat => cat.sub)] }, 0,
                { $cond: [
                  { $eq: ["$mainCategory", category.find(cat => cat.sub.includes("$subCategory"))?.main] }, 1,
                  2
                ]}
              ]
            }
          }
        },
        { $sort: { categoryScore: 1, regionScore: 1 } },
        { $limit: 4 }
      ]);
    }

// 이미지 추가 로직
const clubsWithImages = await Promise.all(
  clubs.map(async (club) => {
    const admin = club.admin;
    const adminData = await User.findOne({ email: admin });
    const adminImage = adminData?.profilePic?.thumbnailImage || null;

    const memberImages = await Promise.all(
      club.members.map(async (memberEmail) => {
        const memberData = await User.findOne({ email: memberEmail });
        return memberData?.profilePic?.thumbnailImage || null;
      }),
    );

    // Mongoose 문서인지 확인하고 toObject() 호출
    return {
      ...(club.toObject ? club.toObject() : club), // Mongoose 문서일 경우에만 toObject() 호출
      adminImage,
      memberImages,
    };
  }),
);

    res.json(clubsWithImages);
  } catch (error) {
    console.error("Error occurred while fetching recommended clubs:", {
      message: error.message,
      stack: error.stack,
      requestQuery: req.query,
      userId: req.query.email || null,
    });
    res.status(500).json({ error: error.message });
  }
});





const memberInfoInsert = async (clubs) => {
  for (let j = 0; j < clubs.length; j++) {
    clubs[j].members.length;
    let memberInfo = [];
    for (let i = 0; i < clubs[j].members.length; i++) {
      let copymember = { thumbnailImage: "", name: "", nickName: "" };
      const userinfo = await User.findOne({ email: clubs[j].members[i] });
      copymember.name = userinfo.name;
      copymember.nickName = userinfo.nickName;
      copymember.thumbnailImage = userinfo.profilePic.thumbnailImage;
      memberInfo.push(copymember);
    }
    clubs[j].memberInfo = memberInfo;
  }
};

module.exports = router;
