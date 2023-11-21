import Bookmarks from "@/components/Bookmarks/Bookmarks";
import AppFlex from "@/components/Shared/AppFlex";
import AppLoading from "@/components/Shared/AppLoading";
import { CombinedDataProvider, useSession } from "@inrupt/solid-ui-react";
import { FC } from "react";

type IProps = {};

const BookmarksPage: FC<IProps> = ({ }) => {
  const { session } = useSession();
  const {
    info: { webId },
  } = session;

  return (
    <AppFlex>
      {webId ? (
        <CombinedDataProvider datasetUrl={webId} thingUrl={webId}>
          <Bookmarks />
        </CombinedDataProvider>
      ) : (
        <AppLoading />
      )}
    </AppFlex>
  );
};

export default BookmarksPage;
