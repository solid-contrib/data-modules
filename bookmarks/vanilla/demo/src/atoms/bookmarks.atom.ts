import { IBookmark } from "@/utils";
import { SolidDataset } from "@inrupt/solid-client";
import { atom, useRecoilState } from "recoil";



const bookmarksAtom = atom<IBookmark[]>({
    key: 'bookmarksAtom',
    default: [],
});


export const usebookmarks = () => {
    const [bookmarks, setBookmarks] = useRecoilState(bookmarksAtom);
    return { bookmarks, setBookmarks };
}