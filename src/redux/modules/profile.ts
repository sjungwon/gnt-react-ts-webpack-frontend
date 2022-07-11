import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  addProfileAPI,
  AddProfileReqType,
  deleteProfileAPI,
  getMyProfilesAPI,
  updateProfileAPI,
} from "../../apis/profile";

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
  name: string;
  createdAt: Date;
}

const SortProfiles = (profiles: ProfileType[]) => {
  return [...profiles].sort((a, b) => {
    if (a.category.title < b.category.title) {
      return -1;
    } else if (a.category.title > b.category.title) {
      return 1;
    } else {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      } else {
        return 0;
      }
    }
  });
};

export const getMyProfilesThunk = createAsyncThunk(
  "profile/getMy",
  async () => {
    const response = await getMyProfilesAPI();
    return response.data;
  }
);

export const addProfileThunk = createAsyncThunk(
  "profile/add",
  async (profileData: AddProfileReqType) => {
    const response = await addProfileAPI(profileData);
    return response.data;
  }
);

export const updateProfileThunk = createAsyncThunk(
  "profile/update",
  async (updateData: { profileId: string; newProfileName: string }) => {
    const response = await updateProfileAPI(
      updateData.profileId,
      updateData.newProfileName
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
  modifyStatus: {
    add: "idle" | "pending" | "success" | "failed";
    [key: string]: "idle" | "pending" | "success" | "failed";
  };
  modifyProfileId: string;
}

const initialState: ProfileState = {
  status: "idle",
  profiles: [],
  modifyStatus: {
    add: "idle",
  },
  modifyProfileId: "",
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setModifyId: (state: ProfileState, action: PayloadAction<string>) => {
      state.modifyProfileId = action.payload;
    },
    clearModifyId: (state: ProfileState) => {
      state.modifyProfileId = "";
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
        state.modifyStatus = {
          add: "pending",
        };
      })
      .addCase(addProfileThunk.fulfilled, (state, action) => {
        state.modifyStatus = {
          add: "success",
          [action.payload._id]: "idle",
        };
        state.profiles = SortProfiles([
          ...state.profiles,
          action.payload as ProfileType,
        ]);
      })
      .addCase(addProfileThunk.rejected, (state, action) => {
        window.alert("프로필 추가에 실패했습니다. 다시 시도해주세요.");
        state.modifyStatus.add = "failed";
      })
      .addCase(updateProfileThunk.pending, (state, action) => {
        state.modifyStatus[state.modifyProfileId] = "pending";
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.modifyStatus[state.modifyProfileId] = "success";
        state.modifyProfileId = "";
        const updatedProfileId = (action.payload as ProfileType)._id;
        state.profiles = SortProfiles(
          state.profiles.map((profile: ProfileType) => {
            return profile._id === updatedProfileId ? action.payload : profile;
          })
        );
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        window.alert("프로필 수정에 실패했습니다. 다시 시도해주세요.");
        state.modifyStatus[state.modifyProfileId] = "failed";
        state.modifyProfileId = "";
      })
      .addCase(deleteProfileThunk.pending, (state, action) => {
        state.modifyStatus[state.modifyProfileId] = "pending";
      })
      .addCase(deleteProfileThunk.fulfilled, (state, action) => {
        const tmp = state.modifyStatus;
        delete tmp[state.modifyProfileId];
        state.modifyStatus = tmp;
        state.modifyProfileId = "";
        const deletedProfileId = action.payload;
        state.profiles = state.profiles.filter(
          (profile: ProfileType) => profile._id !== deletedProfileId
        );
      })
      .addCase(deleteProfileThunk.rejected, (state) => {
        window.alert("프로필 제거에 실패했습니다. 다시 시도해주세요.");
        state.modifyStatus[state.modifyProfileId] = "failed";
        state.modifyProfileId = "";
      });
  },
});

export const { setModifyId, clearModifyId } = profileSlice.actions;

export default profileSlice.reducer;
