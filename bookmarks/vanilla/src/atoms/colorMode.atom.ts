import { atom, useRecoilState } from "recoil";

const colorModeAtom = atom<'light' | 'dark'>({
    key: 'colorMode', // unique ID (with respect to other atoms/selectors)
    default: 'dark', // default value (aka initial value)
});


export const useColorMode = () => {
    const [colorMode, setColorMode] = useRecoilState(colorModeAtom);
    return { colorMode, setColorMode };
}