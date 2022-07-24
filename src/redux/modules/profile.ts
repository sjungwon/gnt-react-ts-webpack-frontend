import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import profileAPI, {
  AddProfileReqType,
  UpdateProfileReqType,
} from "../../apis/profile";
import { TypedForm } from "../../classes/TypedForm";
import { SortProfiles } from "../../functions/SortFunc";

export interface ProfileType {
  _id: string;
  user: {
    _id: string;
    username: string;
  };
  category: {
    _id: string;
    title: string;
  };
  profileImage: {
    URL: string;
    Key: string;
  };
  nickname: string;
  createdAt: string;
}

//GET 유저 프로필 배열 데이터
export const getMyProfilesThunk = createAsyncThunk(
  "profile/getMy",
  async (userId: string) => {
    const response = await profileAPI.get(userId, "id");
    return response.data;
  }
);

//프로필 생성
export const createProfileThunk = createAsyncThunk(
  "profile/add",
  async (profileData: TypedForm<AddProfileReqType>) => {
    const response = await profileAPI.create(profileData);
    return response.data;
  }
);

//프로필 수정
export const updateProfileThunk = createAsyncThunk(
  "profile/update",
  async (updateData: {
    profileId: string;
    profileData: TypedForm<UpdateProfileReqType>;
  }) => {
    const response = await profileAPI.update(
      updateData.profileId,
      updateData.profileData
    );
    return response.data;
  }
);

//프로필 제거
export const deleteProfileThunk = createAsyncThunk(
  "profile/delete",
  async (profileId: string) => {
    await profileAPI.delete(profileId);
    return profileId;
  }
);

//프로필 상태 타입
interface ProfileState {
  //프로필 가져오기 상태
  status: "idle" | "pending" | "success" | "failed";
  //사용자 프로필 배열 데이터
  profiles: ProfileType[];
  //프로필 추가, 수정, 삭제 상태
  modifyProfileStatus: "idle" | "pending" | "success" | "failed";
  //빈 프로필 데이터
  initialProfile: ProfileType;
}

//초기 프로필 상태
const initialState: ProfileState = {
  status: "idle",
  profiles: [],
  modifyProfileStatus: "idle",
  initialProfile: {
    _id: "",
    user: {
      _id: "",
      username: "",
    },
    category: {
      _id: "",
      title: "",
    },
    profileImage: {
      URL: "",
      Key: "",
    },
    nickname: "",
    createdAt: "",
  },
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    //로그아웃시 사용자 프로필 상태 초기화
    clearProfileStateLogout: (state: ProfileState) => {
      state.status = "idle";
      state.profiles = [];
      state.modifyProfileStatus = "idle";
    },
    //프로필 추가, 수정, 삭제 상태 초기화
    clearModifyProfileStatus: (state: ProfileState) => {
      state.modifyProfileStatus = "idle";
    },
  },
  extraReducers(builder) {
    builder
      //프로필 가져오기 진행
      .addCase(getMyProfilesThunk.pending, (state, action) => {
        state.status = "pending";
      })
      //프로필 가져오기 성공
      .addCase(getMyProfilesThunk.fulfilled, (state, action) => {
        state.status = "success";
        //프로필 카테고리 - 이름별 정렬
        state.profiles = SortProfiles(action.payload as ProfileType[]);
      })
      //프로필 가져오기 실패
      .addCase(getMyProfilesThunk.rejected, (state, action) => {
        state.status = "failed";
      })
      //프로필 추가 진행
      .addCase(createProfileThunk.pending, (state, action) => {
        state.modifyProfileStatus = "pending";
      })
      //프로필 추가 성공
      .addCase(createProfileThunk.fulfilled, (state, action) => {
        state.modifyProfileStatus = "success";
        state.profiles = SortProfiles([
          ...state.profiles,
          action.payload as ProfileType,
        ]);
      })
      //프로필 추가 실패
      .addCase(createProfileThunk.rejected, (state, action) => {
        window.alert("프로필 추가에 실패했습니다. 다시 시도해주세요.");
        state.modifyProfileStatus = "failed";
      })
      //프로필 수정 진행
      .addCase(updateProfileThunk.pending, (state, action) => {
        state.modifyProfileStatus = "pending";
      })
      //프로필 수정 성공
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.modifyProfileStatus = "success";
        const updatedProfileId = (action.payload as ProfileType)._id;
        state.profiles = SortProfiles(
          state.profiles.map((profile: ProfileType) => {
            return profile._id === updatedProfileId ? action.payload : profile;
          })
        );
        //포스트 데이터에 반영하기 위해 새로고침
        //포스트 데이터가 프로필 참조 중
        window.location.reload();
      })
      //프로필 수정 실패
      .addCase(updateProfileThunk.rejected, (state, action) => {
        window.alert("프로필 수정에 실패했습니다. 다시 시도해주세요.");
        state.modifyProfileStatus = "failed";
      })
      //프로필 제거 진행
      .addCase(deleteProfileThunk.pending, (state, action) => {
        state.modifyProfileStatus = "pending";
      })
      //프로필 제거 성공
      .addCase(deleteProfileThunk.fulfilled, (state, action) => {
        state.modifyProfileStatus = "success";
        const deletedProfileId = action.payload;
        state.profiles = state.profiles.filter(
          (profile: ProfileType) => profile._id !== deletedProfileId
        );
        //포스트 데이터에 반영하기 위해 새로고침
        window.location.reload();
      })
      //프로필 제거 실패
      .addCase(deleteProfileThunk.rejected, (state) => {
        window.alert("프로필 제거에 실패했습니다. 다시 시도해주세요.");
        state.modifyProfileStatus = "failed";
      });
  },
});

export const { clearModifyProfileStatus, clearProfileStateLogout } =
  profileSlice.actions;

export default profileSlice.reducer;
