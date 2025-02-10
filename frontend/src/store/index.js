import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userSlice from "./reducers/userSlice.js";
import wishSlice from "./reducers/wishSlice.js";
import recentVisitSlice from "./reducers/recentVisitSlice.js";
import myMessageSlice from "./reducers/myMessageSlice.js";
import { categoryClubListReducer, clubListReducer, getClubMemberReducer, getClubReducer, meetingListReducer } from "./reducers/clubReducer.js"; // 명시적으로 임포트
import storage from "redux-persist/lib/storage"; // 로컬 스토리지
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistStore, persistReducer } from "redux-persist";
import chatReducer from "./reducers/chatSlice.js";

const persistConfig = {
  key: "root",
  storage: storage,
  whitelist: ["user", "club", "getClub", "meetingList", "categoryClub", "getClubMember", "chat", 'wish', 'myMessage', 'recentVisit'],
};

const rootReducer = combineReducers({
  user: userSlice,
  club: clubListReducer, // clubList 리듀서
  getClub: getClubReducer, // getClub 리듀서
  getClubMember: getClubMemberReducer, // 클럽에서의 멤버 리듀서
  meetingList: meetingListReducer,
  categoryClub: categoryClubListReducer,
  chat: chatReducer,
  wish: wishSlice,
  myMessage : myMessageSlice,
  recentVisit : recentVisitSlice
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
