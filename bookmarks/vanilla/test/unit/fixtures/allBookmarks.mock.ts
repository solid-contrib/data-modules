import { IBookmark } from "../../../src/modules/Bookmark";

export const allBookmarksMock: IBookmark[] = [
    {
        url: 'https://fake-pod.net/path/to/bookmark-formats.ttl#one',
        title: 'one',
        link: 'http://example.com',
        created: '2023-10-21T14:16:16Z',
        updated: '2023-11-21T14:16:16Z',
        creator: 'https://michielbdejong.solidcommunity.net/profile/card#me'
    },
    {
        url: 'https://fake-pod.net/path/to/bookmark-formats.ttl#two',
        title: 'two',
        link: 'http://example.com',
        creator: 'https://michielbdejong.solidcommunity.net/profile/card#me'
    },
    {
        url: 'https://fake-pod.net/path/to/bookmark-formats.ttl#three',
        title: 'three',
        topic: "http://wikipedia.org/sdfg",
        link: 'http://example.com',
    },
    {
        url: '/b93d9944-d54d-42f6-a39b-6ea3f9217763',
        title: 'sdf',
        link: 'http://example.com',
    },
    {
        url: '/b93d9944-d54d-42f6-a39b-6ea3f9217763-metadata',
        title: '',
        link: '',
    }
]