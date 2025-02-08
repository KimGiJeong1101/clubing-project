import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

// AsyncThunk 정의
const fetchClubList = createAsyncThunk("clubList/fetchClubList", async () => {
  const response = await fetch("http://localhost:4000/clubs");
  const data = await response.json();
  return data;
});

const fetchGetClub = createAsyncThunk("clubList/fetchGetClub", async (id) => {
  const response = await fetch(`http://localhost:4000/clubs/read2/${id}`);
  const data = await response.json();
  return data;
});

const fetchGetClubMember = createAsyncThunk("clubs/fetchGetClubMember", async (clubMembers) => {
  const response = await axiosInstance.post(`http://localhost:4000/clubs/membersInfo`, clubMembers);
  const data = await response.data;
  return data;
});

const fetchMeetingList = createAsyncThunk("meetingList/fetchMeetingList", async (clubNumber) => {
  const response = await fetch(`http://localhost:4000/meetings/${clubNumber}`);
  const data = await response.json();
  return data;
});

const fetchCategoryClubList = createAsyncThunk("CategoryClubList/fetchCategoryClubList", async (Category) => {
  const response = await fetch(`http://localhost:4000/clubs/category/${Category}`);
  const data = await response.json();
  return data;
});

// Slice 정의
//클럽 리스트 가져오기
const clubList = createSlice({
  name: "clubList",
  initialState: { clubs: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClubList.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchClubList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.clubs = action.payload;
      })
      .addCase(fetchClubList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

//클럽 하나 정보 가져오기
const getClub = createSlice({
  name: "getClub",
  initialState: { clubs: {}, status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGetClub.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGetClub.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.clubs = action.payload;
      })
      .addCase(fetchGetClub.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

//클럽에 관련된 멤버들 정보 가져오기
const getClubMember = createSlice({
  name: "getClubMember",
  initialState: { getClubMembers: {}, status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGetClubMember.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGetClubMember.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.getClubMembers = action.payload;
      })
      .addCase(fetchGetClubMember.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

// 정모 리스트 가져오기
const meetingList = createSlice({
  name: "meetingList",
  initialState: { meetings: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeetingList.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMeetingList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.meetings = action.payload;
      })
      .addCase(fetchMeetingList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

//카테고리 리스트 가져오기
const categoryClubList = createSlice({
  name: "categoryClubList",
  initialState: { clubs: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoryClubList.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCategoryClubList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.clubs = action.payload;
      })
      .addCase(fetchCategoryClubList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

// 리듀서 export
export const clubListReducer = clubList.reducer;
export const categoryClubListReducer = categoryClubList.reducer;
export const meetingListReducer = meetingList.reducer;
export const getClubReducer = getClub.reducer;
export const getClubMemberReducer = getClubMember.reducer;
export { fetchClubList, fetchGetClub, fetchMeetingList, fetchCategoryClubList, fetchGetClubMember };
