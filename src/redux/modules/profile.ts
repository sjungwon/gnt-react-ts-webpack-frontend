import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addProfileAPI,
  AddProfileReqType,
  deleteProfileAPI,
  getProfilesAPI,
  updateProfileAPI,
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

export const getMyProfilesThunk = createAsyncThunk(
  "profile/getMy",
  async (userId: string) => {
    const response = await getProfilesAPI(userId, "id");
    return response.data;
  }
);

export const addProfileThunk = createAsyncThunk(
  "profile/add",
  async (profileData: TypedForm<AddProfileReqType>) => {
    const response = await addProfileAPI(profileData);
    return response.data;
  }
);

export const updateProfileThunk = createAsyncThunk(
  "profile/update",
  async (updateData: {
    profileId: string;
    profileData: TypedForm<UpdateProfileReqType>;
  }) => {
    const response = await updateProfileAPI(
      updateData.profileId,
      updateData.profileData
    );
    return response.data;
  }
);

export const deleteProfileThunk = createAsyncThunk(
  "profile/delete",
  async (profileId: string) => {
    await deleteProfileAPI(profileId);
    return profileId;
  }
);

interface ProfileState {
  status: "idle" | "pending" | "success" | "failed";
  profiles: ProfileType[];
  modifyProfileStatus: "idle" | "pending" | "success" | "failed";
  initialProfile: ProfileType;
}

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
    clearModifyProfileStatus: (state: ProfileState) => {
      state.modifyProfileStatus = "idle";
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getMyProfilesThunk.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(getMyProfilesThunk.fulfilled, (state, action) => {
        state.status = "success";
        state.profiles = SortProfiles(action.payload as ProfileType[]);
      })
      .addCase(getMyProfilesThunk.rejected, (state, action) => {
        state.status = "failed";
      })
      .addCase(addProfileThunk.pending, (state, action) => {
        state.modifyProfileStatus = "pending";
      })
      .addCase(addProfileThunk.fulfilled, (state, action) => {
        state.modifyProfileStatus = "success";
        state.profiles = SortProfiles([
          ...state.profiles,
          action.payload as ProfileType,
        ]);
      })
      .addCase(addProfileThunk.rejected, (state, action) => {
        window.alert("프로필 추가에 실패했습니다. 다시 시도해주세요.");
        state.modifyProfileStatus = "failed";
      })
      .addCase(updateProfileThunk.pending, (state, action) => {
        state.modifyProfileStatus = "pending";
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.modifyProfileStatus = "success";
        const updatedProfileId = (action.payload as ProfileType)._id;
        state.profiles = SortProfiles(
          state.profiles.map((profile: ProfileType) => {
            return profile._id === updatedProfileId ? action.payload : profile;
          })
        );
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        window.alert("프로필 수정에 실패했습니다. 다시 시도해주세요.");
        state.modifyProfileStatus = "failed";
      })
      .addCase(deleteProfileThunk.pending, (state, action) => {
        state.modifyProfileStatus = "pending";
      })
      .addCase(deleteProfileThunk.fulfilled, (state, action) => {
        state.modifyProfileStatus = "success";
        const deletedProfileId = action.payload;
        state.profiles = state.profiles.filter(
          (profile: ProfileType) => profile._id !== deletedProfileId
        );
        window.location.reload();
      })
      .addCase(deleteProfileThunk.rejected, (state) => {
        window.alert("프로필 제거에 실패했습니다. 다시 시도해주세요.");
        state.modifyProfileStatus = "failed";
      });
  },
});

export const { clearModifyProfileStatus } = profileSlice.actions;

export default profileSlice.reducer;
