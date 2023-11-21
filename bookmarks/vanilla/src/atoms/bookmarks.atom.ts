import { SolidDataset } from "@inrupt/solid-client";
import { atom, useRecoilState } from "recoil";

const bookmarksAtom = atom<SolidDataset>({
    key: 'bookmarksAtom',
    default: {} as SolidDataset,
});


export const usebookmarks = () => {
    const [bookmarks, setBookmarks] = useRecoilState(bookmarksAtom);
    return { bookmarks, setBookmarks };
}