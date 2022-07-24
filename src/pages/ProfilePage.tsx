import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import profileAPI from "../apis/profile";
import InfoCard from "../components/molecules/InfoCard";
import ProfileCard from "../components/molecules/ProfileCard";
import PostList from "../components/organisms/PostList";
import { setCurrentCategoryByTitle } from "../redux/modules/category";
import { ProfileType } from "../redux/modules/profile";
import { AppDispatch, RootState } from "../redux/store";
import HomePage from "./HomePage";

export default function ProfilePage() {
  const params = useParams();

  const initialProfile = useSelector(
    (state: RootState) => state.profile.initialProfile
  );
  const [profile, setProfile] = useState<ProfileType>(initialProfile);

  const getProfile = useCallback(async () => {
    if (!params.id) {
      return;
    }
    try {
      const response = await profileAPI.getById(params.id);
      if (response.data?._id) {
        setProfile(response.data);
      }
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        window.alert(
          "프로필 정보를 가져오는데 오류가 발생했습니다. 다시 시도해주세요."
        );
      }
    }
  }, [params.id]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(setCurrentCategoryByTitle(""));
  }, [dispatch]);

  if (!params.id) {
    return <HomePage />;
  }

  return (
    <>
      <InfoCard text={`${profile.user.username} / ${profile.nickname}`} />
      <ProfileCard profile={profile} />
      <PostList type="profile" params={params.id} />
    </>
  );
}
