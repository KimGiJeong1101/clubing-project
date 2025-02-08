const Message = require("../models/Message");
const ChatRoom = require("../models/ChattingRoom");

module.exports = (io) => {
  // 소켓 서버 연결 시 이벤트 처리
  io.on("connection", (socket) => {
    const clientIp = socket.handshake.address;
    console.log("새로운 클라이언트 연결됨:", socket.id); // 소켓의 고유 ID를 출력합니다.
    console.log(`소켓 ID: ${socket.id}, 클라이언트 IP: ${clientIp}`);

    console.log(clientIp);
    console.log(clientIp);

    console.log("소켓핸들쉨");
    console.log("새로운 클라이언트 연결됨:", socket.id);

    // 클라이언트가 특정 방에 입장할 때 처리
    socket.on("joinRoom", ({ clubId }) => {
      socket.join(clubId); // 클라이언트를 해당 방에 입장시킴
      console.log(`${socket.id}가 방 ${clubId}에 입장했습니다.`);
      console.log(`${socket.id}가 방 ${clubId}에 입장했습니다.`);
      console.log(`${socket.id}가 방 ${clubId}에 입장했습니다.`);
    });

    // 클라이언트가 메시지를 보낼 때 처리
    socket.on("message", async ({ clubId, senderId, content, images }) => {
      console.log("서버에서 수신한 메시지:", { clubId, senderId, content, images });

      // 메시지 내용이 없고 이미지도 없으면 오류 처리
      if (!content && (!images || images.length === 0)) {
        console.error("메시지 내용 또는 이미지가 필요합니다.");
        return; // 메시지가 유효하지 않으면 함수 종료
      }

      try {
        // 1. 먼저 해당 clubId에 해당하는 채팅방을 찾습니다.
        const chatRoom = await ChatRoom.findOne({ clubId });

        // 2. 채팅방이 존재하지 않으면 오류 반환
        if (!chatRoom) {
          console.error(`채팅방을 찾을 수 없습니다. clubId: ${clubId}`);
          return;
        }

        // 3. 참가자 목록에서 해당 사용자가 존재하는지 확인합니다.
        const isParticipant = chatRoom.participants.some((participant) => participant.userId.toString() === senderId);

        // 4. 사용자가 참가자 목록에 없으면 메시지를 보낼 수 없도록 처리합니다.
        if (!isParticipant) {
          console.error(`사용자가 채팅방에 참가되어 있지 않습니다. senderId: ${senderId}`);
          return;
        }

        // 5. 메시지를 저장하고 클라이언트에게 전송하는 부분은 그대로 유지합니다.
        const newMessage = new Message({
          clubId: clubId,
          sender: senderId,
          content: content || "",
          images: images || [],
          timestamp: new Date(),
        });

        // 메시지를 데이터베이스에 저장
        await newMessage.save();
        console.log("메시지 저장 성공:", newMessage);

        // 방에 있는 모든 클라이언트에게 메시지 전송
        io.to(clubId).emit("message", newMessage);
      } catch (error) {
        console.error("메시지를 저장하는 중 오류 발생:", error);
      }
    });

    // 클라이언트 연결 해제 시 처리
    socket.on("disconnect", () => {
      console.log("클라이언트 연결 해제됨:", socket.id);
    });
  });
};
