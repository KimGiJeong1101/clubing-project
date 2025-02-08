// 이 파일은 채팅방을 관리하는 REST API를 제공합니다.
// 클라이언트는 HTTP 요청을 통해 채팅방을 생성하거나 조회할 수 있습니다.

const express = require("express");
const router = express.Router();
const ChatRoom = require("../models/ChattingRoom"); // ChatRoom 모델 불러오기
const Club = require("../models/Club"); // Club 모델 불러오기
const Message = require("../models/Message"); // Message 모델 불러오기
const User = require("../models/User"); // User 모델 불러오기
const mongoose = require("mongoose");
const ReadBy = require("../models/ReadBy"); // ReadBy 모델 불러오기
const auth = require("../middleware/auth"); // auth 미들웨어 임포트

// 사용자 ID로 사용자 정보를 가져오는 함수
const getUserById = async (id) => {
  try {
    // 몽구스는 ID를 _id로 사용할 수도 있지만, findById 메서드를 사용해 사용자 검색 가능
    // User 모델을 사용하여 주어진 ID로 사용자 검색
    return await User.findById(id);
  } catch (error) {
    // 사용자 정보를 가져오는 중 오류가 발생하면 콘솔에 로그를 출력
    console.error("Error fetching user:", error);
    // 호출한 곳에서 이 오류를 처리할 수 있도록 새로운 오류를 던짐
    throw new Error("Error fetching user");
  }
};

// POST 요청을 처리하는 라우터 핸들러
router.post("/room", auth, async (req, res) => {
  try {
    // 클라이언트로부터 받은 요청 본문에서 clubId와 participants를 추출
    const { clubId, participants } = req.body;

    // 요청 본문을 로그에 출력하여 디버깅에 도움을 줌
    console.log("Received request body:", req.body);
    console.log("Received clubId:", clubId);
    console.log("Received participants:", participants);
    console.log("-----------------------");

    // clubId가 제공되지 않은 경우, 클라이언트에게 에러 메시지를 반환
    if (!clubId) {
      return res.status(400).json({ message: "clubId는 필수 항목입니다." });
    }

    // clubId에 해당하는 모임이 실제로 존재하는지 확인
    const clubExists = await Club.findById(clubId);
    if (!clubExists) {
      // 모임이 존재하지 않을 경우, 클라이언트에게 에러 메시지를 반환
      return res.status(404).json({ message: "해당 모임이 존재하지 않습니다." });
    }

    const userId = req.user.email; // 요청한 사용자의 ID (로그인 정보를 req.user로 받아왔을 때)

    console.log("지금로그인한사람 누구니~?" + userId);
    if (!clubExists.members.includes(userId.toString())) {
      return res.status(403).json({ message: "모임에 가입된 멤버만 채팅방에 접근할 수 있습니다." });
    }

    // participants 배열이 유효한지 확인
    // 배열이 아니거나 길이가 0인 경우, 클라이언트에게 에러 메시지를 반환
    if (!Array.isArray(participants) || participants.length === 0) {
      console.error("Invalid participants array:", participants);
      return res.status(400).json({ message: "참가자 목록이 유효하지 않습니다." });
    }

    // 참가자 ID 배열을 순회하며 사용자 정보를 비동기적으로 가져옴
    const participantUsers = await Promise.all(
      participants.map(async (id) => {
        try {
          // 각 참가자 ID에 대해 사용자 정보를 가져옴
          console.log("Fetching user for ID:", id);
          return await getUserById(id);
        } catch (err) {
          // 사용자 정보를 가져오는 중 오류가 발생하면 로그를 출력하고 null 반환
          console.error("Error fetching user by ID:", id, err);
          return null;
        }
      }),
    );

    // 유효한 사용자들만 필터링하고 ObjectId로 변환
    const participantObjectIds = participantUsers
      .filter((user) => user) // null 값은 제거
      .map((user) => new mongoose.Types.ObjectId(user._id)); // 사용자 ID를 ObjectId로 변환

    console.log("Participant Object IDs:", participantObjectIds);

    // clubId로 이미 존재하는 채팅방을 찾음
    let chatRoom = await ChatRoom.findOne({ clubId });
    if (chatRoom) {
      console.log("Existing chat room found:", chatRoom);

      // 기존 참가자 목록에서 참가자의 ObjectId를 문자열로 변환
      const existingParticipants = chatRoom.participants.map((participant) => participant.userId.toString());

      // 새로운 참가자들을 추가하고 중복을 제거
      const newParticipants = participantObjectIds.map((id) => ({
        userId: id,
        timestamp: new Date(), // 참가 시간 기록
      }));

      // 참가자 목록 업데이트 (기존 참가자와 새로운 참가자를 합쳐서 중복 제거)
      const updatedParticipants = [...chatRoom.participants, ...newParticipants.filter((newParticipant) => !existingParticipants.includes(newParticipant.userId.toString()))];

      // 채팅방의 참가자 목록을 업데이트
      chatRoom.participants = updatedParticipants;

      // 업데이트된 채팅방을 데이터베이스에 저장
      const updatedChatRoom = await chatRoom.save();
      console.log("Updated chatRoom:", updatedChatRoom);

      // 업데이트된 채팅방 정보를 클라이언트에 반환
      return res.status(200).json(updatedChatRoom);
    }

    // 새로운 채팅방을 생성할 때, participants 배열에 timestamp를 포함
    const newParticipants = participantObjectIds.map((id) => ({
      userId: id,
      timestamp: new Date(), // 참가 시간 기록
    }));

    // 새로운 채팅방을 생성
    const newChatRoom = new ChatRoom({
      clubId,
      participants: newParticipants,
    });

    // 새로운 채팅방을 데이터베이스에 저장
    const savedChatRoom = await newChatRoom.save();
    console.log("Newly saved chatRoom:", savedChatRoom);

    // 생성된 채팅방 정보를 클라이언트에 반환
    res.status(201).json(savedChatRoom);
  } catch (error) {
    // 채팅방 생성 또는 업데이트 중 오류가 발생하면 콘솔에 로그를 출력
    console.error("Error creating or updating chat room:", error);

    // 클라이언트에게 오류 메시지를 반환
    res.status(500).json({ message: "채팅방 생성에 실패했습니다." });
  }
});

router.get("/room/:clubId", auth, async (req, res) => {
  try {
    console.log("하하하하하하");
    console.log(req.query.clubNumber);
    console.log(req.params.clubNumber);
    console.log("하하하하하하");

    const clubId = req.params.clubId;
    // URL에서 clubNumber를 가져옴
    console.log(clubId);

    console.log("Fetching chat room with clubId:", clubId);

    // clubId로 채팅방 조회
    const chatRoom = await ChatRoom.findOne({ clubId });

    if (!chatRoom) {
      console.log("Chat room not found");
      return res.status(404).json({ message: "채팅방을 찾을 수 없습니다." });
    }

    console.log("Chat room found:", chatRoom);
    const club = await Club.findById(chatRoom.clubId);

    if (!club) {
      console.log("Club not found with ID:", chatRoom.clubId);
      return res.status(404).json({ message: "모임을 찾을 수 없습니다." });
    }

    // 모임에 참가한 멤버인지 확인
    const userId = req.user.email; // 로그인 정보를 통해 가져온 사용자 ID

    console.log("지금 로그인 누구? 2번째" + userId);
    if (!club.members.includes(userId.toString())) {
      return res.status(403).json({ message: "모임에 가입된 멤버만 채팅방에 접근할 수 있습니다." });
    }

    console.log("Club found:", club);
    res.status(200).json({ chatRoom, club }); // 채팅방과 클럽 정보 반환
  } catch (error) {
    console.error("Error fetching chat room by clubId:", error);
    res.status(500).json({ message: "채팅방 세부 정보를 가져오는 중 오류가 발생했습니다." });
  }
});

router.get("/:clubId/messages", auth, async (req, res) => {
  const { clubId } = req.params;
  const { skip = 0, limit = 30 } = req.query;

  try {
    // 1. 해당 clubId의 채팅방을 찾기
    const chatRoom = await ChatRoom.findOne({ clubId });
    if (!chatRoom) {
      return res.status(404).json({ error: "채팅방을 찾을 수 없습니다." });
    }

    // 2. 요청한 사용자의 ID로 참가 기록을 확인
    const userId = req.user._id;

    console.log("리퀘스트유저아이디 뭘로 뜨는지 " + userId);
    

    const participant = chatRoom.participants.find((p) => p.userId.equals(userId));

    if (!participant) {
      return res.status(403).json({ message: "이 채팅방에 참가하지 않았습니다." });
    }

    // 3. 참가한 시간 이후의 메시지를 조회
    const messages = await Message.find({
      clubId, // 해당 클럽의 메시지
      timestamp: { $gte: participant.timestamp }, // 참가 시간 이후의 메시지
    })
      .sort({ timestamp: -1 }) // 최신순으로 정렬
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    res.json(messages); // 조회한 메시지 반환
  } catch (error) {
    console.error("메시지 조회 중 오류:", error);
    res.status(500).json({ error: "메시지를 불러오는데 실패했습니다." });
  }
});

// router.post('/:messageId/read', async (req, res) => {
//   const { messageId } = req.params;
//   const { userId } = req.body;

//   console.log("POST request received. Message ID:", messageId, "User ID:", userId);

//   try {
//     // 메시지가 존재하는지 확인
//     const message = await Message.findById(messageId);
//     if (!message) {
//       console.log("Message not found for ID:", messageId);
//       return res.status(404).json({ message: '메시지가 존재하지 않습니다.' });
//     }

//     let readBy = await ReadBy.findOne({ messageId });

//     if (readBy) {
//       console.log("ReadBy document found:", readBy);
//       const userIndex = readBy.users.findIndex(user => user.userId.toString() === userId);
//       if (userIndex === -1) {
//         console.log("User not found in readBy.users, adding new user.");
//         readBy.users.push({ userId, readAt: new Date() });
//         await readBy.save();
//       } else {
//         console.log("User found in readBy.users, updating readAt.");
//         readBy.users[userIndex].readAt = new Date();
//         await readBy.save();
//       }
//     } else {
//       console.log("No ReadBy document found, creating new one.");
//       readBy = new ReadBy({
//         messageId,
//         users: [{ userId, readAt: new Date() }]
//       });
//       await readBy.save();
//     }

//     res.status(200).json({ message: '읽음 상태가 업데이트되었습니다.' });
//   } catch (error) {
//     console.error("Error in POST /:messageId/read:", error);
//     res.status(500).json({ error: '서버 오류가 발생했습니다.' });
//   }
// });

// router.get('/chatrooms/messages/:messageId/read', async (req, res) => {
//   const { messageId } = req.params;

//   console.log("GET request received for message ID:", messageId);

//   try {
//     // 메시지가 존재하는지 확인
//     const message = await Message.findById(messageId);
//     if (!message) {
//       console.log("Message not found for ID:", messageId);
//       return res.status(404).json({ message: '메시지가 존재하지 않습니다.' });
//     }

//     const readBy = await ReadBy.findOne({ messageId });
//     if (readBy) {
//       console.log("ReadBy document found:", readBy);
//       res.status(200).json({ readBy: readBy.users });
//     } else {
//       console.log("No readBy document found for message ID:", messageId);
//       res.status(404).json({ message: '읽음 기록이 없습니다.' });
//     }
//   } catch (error) {
//     console.error("Error in GET /chatrooms/messages/:messageId/read:", error);
//     res.status(500).json({ error: '서버 오류가 발생했습니다.' });
//   }
// });

module.exports = router;
