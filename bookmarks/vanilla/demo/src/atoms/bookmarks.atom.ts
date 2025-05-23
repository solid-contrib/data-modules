import { IBookmark } from "../../../src";
// import { SolidDataset } from "@inrupt/solid-client";
import { atom, useRecoilState } from "recoil";



const bookmarksAtom = atom<IBookmark[]>({
    key: 'bookmarksAtom',
    default: [],
});


export const useBookmarks = () => {
    const [bookmarks, setBookmarks] = useRecoilState(bookmarksAtom);
    return { bookmarks, setBookmarks };
}