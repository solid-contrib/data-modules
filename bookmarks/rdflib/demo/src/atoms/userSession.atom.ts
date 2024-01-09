import { Session } from "@inrupt/solid-client-authn-browser";
import { atom, useRecoilState } from "recoil";

const userSessionAtom = atom<Session | undefined>({
    key: "userSessionAtom",
    default: undefined
})


export const useUserSession = () => {
    const [userSession, setUserSession] = useRecoilState(userSessionAtom)
    return { userSession, setUserSession }
}