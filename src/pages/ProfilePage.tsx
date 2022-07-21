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

  console.log(params);

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
    } catch (err) {
      console.log(err);
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
