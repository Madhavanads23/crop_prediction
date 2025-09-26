import { useRefreshHandler } from "@/hooks/use-refresh-handler";
import { RefreshModal } from "./RefreshModal";

export function RefreshHandler() {
  const { showRefreshModal, refreshPageName, handleStayOnPage, handleGoHome } = useRefreshHandler();

  return (
    <RefreshModal
      isOpen={showRefreshModal}
      pageName={refreshPageName}
      onStayOnPage={handleStayOnPage}
      onGoHome={handleGoHome}
    />
  );
}