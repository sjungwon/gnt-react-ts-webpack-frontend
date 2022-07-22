import { PayloadAction } from "@reduxjs/toolkit";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";

interface PropsType {
  API: () => Promise<void>;
  actionCreator: () => PayloadAction<any>;
  contentType: string;
}

export default function useBlockContent({
  API,
  actionCreator,
  contentType,
}: PropsType) {
  const [showBlockModal, setShowBlockModal] = useState(false);
  const handleBlockModalClose = useCallback(() => {
    setShowBlockModal(false);
  }, []);
  const handleBlockModalOpen = useCallback(() => {
    setShowBlockModal(true);
  }, []);

  const [blockLoading, setBlockLoading] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();

  const sendBlockContent = useCallback(async () => {
    try {
      setBlockLoading(true);
      await API();
      dispatch(actionCreator());
      setBlockLoading(false);
      setShowBlockModal(false);
    } catch {
      window.alert(
        `${contentType}을 차단하는데 오류가 발생했습니다. 다시 시도해주세요.`
      );
      setBlockLoading(false);
    }
  }, [API, actionCreator, contentType, dispatch]);

  return {
    showBlockModal,
    handleBlockModalClose,
    handleBlockModalOpen,
    blockLoading,
    sendBlockContent,
  };
}
