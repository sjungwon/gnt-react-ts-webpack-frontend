import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getProfileByIdAPI } from "../apis/profile";
import InfoCard from "../components/molecules/InfoCard";
import ProfileCard from "../components/molecules/ProfileCard";
import PostList from "../components/organisms/PostList";
import { ProfileType } from "../redux/modules/profile";
import { RootState } from "../redux/store";
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
      const response = await getProfileByIdAPI(params.id);
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
