import {
  Button,
  ButtonGroup,
  Flex,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

import {
  Bookmark,
  BookmarkFactory,
} from "../../../src/modules/Bookmarks";

import { FC, useEffect, useState } from "react";
import { FieldType } from "soukai";
import { SolidHasManyRelation, SolidModel } from "soukai-solid";
import { useUserSession } from "../atoms/userSession.atom";


const Bookmarks: FC = () => {
  const { userSession } = useUserSession();
  const [form, setForm] = useState({ title: "", link: "", topic: "" });
  const [bookmarks, setBookmarks] = useState<(Bookmark & SolidModel)[]>([]);

  useEffect(() => {
    (async () => {
      console.log('bookmarks usuable yet?');
      if (!userSession) return;
      console.log('yes!');
      const factory = await BookmarkFactory.getInstance(
        {
          webId: userSession?.info.webId ?? "",
          fetch: userSession?.fetch,
          isPrivate: true,
        }
      );

      const bookmarks = await factory.getAll();
      console.log("🚀 ~ file: Bookmarks.tsx:46 ~ bookmarks:", bookmarks.map(x => x.getAttributes()))
      setBookmarks(bookmarks);

    })();
  }, []);

  return (
    <>
      <Flex gap={2}>
        <Input
          value={form?.title}
          placeholder="title"
          onChange={(e) =>
            setForm((prev: any) => ({ ...prev, title: e.target.value }))
          }
        />
        <Input
          value={form?.topic}
          placeholder="topic"
          onChange={(e) =>
            setForm((prev: any) => ({ ...prev, topic: e.target.value }))
          }
        />
        <Input
          value={form?.link}
          placeholder="link"
          onChange={(e) =>
            setForm((prev: any) => ({ ...prev, link: e.target.value }))
          }
        />

        <Button
          onClick={async () => {
            const factory = await BookmarkFactory.getInstance(
              {
                webId: userSession?.info.webId ?? "",
                fetch: userSession?.fetch,
                isPrivate: true,
              }
            );

            console.log("🚀 ~ file: Bookmarks.tsx:99 ~ onClick={ ~ form:", form)
            const bookmark = await factory.create(form);
            console.log("🚀 ~ file: Bookmarks.tsx:100 ~ bookmark:", bookmark)




            setForm({ title: "", link: "", topic: "" });

            const bookmarks = await factory.getAll();
            console.log("🚀 ~ file: Bookmarks.tsx:112 ~ bookmarks:", bookmarks)
            console.log("🚀 ~ file: Bookmarks.tsx:46 ~ bookmarks:", bookmarks.map(x => x.getAttributes()))
            setBookmarks(bookmarks);
          }}
        >
          ADD
        </Button>
      </Flex>
      <div>
        <Table
          variant="striped"
          size="sm"
        >
          <Thead>
            <Tr>
              <Th>title</Th>
              <Th>topic</Th>
              <Th>Link</Th>
              <Th>actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {bookmarks?.map((b, i) => (
              <Tr key={i}>
                <Td>{b.title}</Td>
                <Td>{b.topic}</Td>
                <Td><a>{b.link}</a></Td>
                <Td>
                  <ButtonGroup variant="outline">
                    <Button
                      onClick={async () => {
                        const factory = await BookmarkFactory.getInstance({
                          webId: userSession?.info.webId ?? "",
                          fetch: userSession?.fetch,
                          isPrivate: true,
                        });

                        const bookmark = await factory.get(b.url);
                        console.log("🚀 ~ file: Bookmarks.tsx:122 ~ <ButtononClick={ ~ bookmark:", bookmark?.getAttributes());
                      }}
                    >
                      GET
                    </Button>

                    <Button
                      onClick={async () => {
                        const factory = await BookmarkFactory.getInstance({
                          webId: userSession?.info.webId ?? "",
                          fetch: userSession?.fetch,
                          isPrivate: true,
                        });

                        const bookmark = await factory.update(b.url, {
                          ...(b as any),
                          label: (Math.random() + 1).toString(36).substring(7),
                        });
                        console.log(
                          "🚀 ~ file: Bookmarks.tsx:122 ~ <ButtononClick={ ~ bookmark:",
                          bookmark?.getAttributes()
                        );
                      }}
                    >
                      UPD
                    </Button>

                    <Button
                      onClick={async () => {
                        const factory = await BookmarkFactory.getInstance({
                          webId: userSession?.info.webId ?? "",
                          fetch: userSession?.fetch,
                          isPrivate: true,
                        });

                        await factory.remove(b.url);
                      }}
                    >
                      DEL
                    </Button>
                  </ButtonGroup>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </>
  );
};

export default Bookmarks;


export class BookmarkModel extends SolidModel {
  static rdfContexts = {
    bk: "http://www.w3.org/2002/01/bookmark#",
  }
  static rdfsClasses = ["bk:Bookmark"]
  static timestamps: []
  static fields = {
    topic: {
      type: FieldType.Key,
      rdfProperty: "bk:hasTopic",
    },
    label: {
      type: FieldType.String,
      rdfProperty: "rdfs:label",
    },
    link: {
      type: FieldType.Key,
      rdfProperty: "bk:recalls",
    },
  }

  public topic: TopicModel[] | undefined;
  public relatedTopic!: SolidHasManyRelation<BookmarkModel, TopicModel, typeof TopicModel>;
  topicRelationship() {
    return this.hasOne(TopicModel, "object").usingSameDocument()
    // return this.hasOne(TopicModel, "object", "topic")
  }
}

export class TopicModel extends SolidModel {
  static rdfContexts = {
    bk: "http://www.w3.org/2002/01/bookmark#",
  }
  static rdfsClasses = ["bk:hasTopic"]
  static timestamps: []
  static fields = {
    label: {
      type: FieldType.String,
      rdfProperty: "rdfs:label",
    },
  }
  bookmarkRelationship() {
    return this.belongsToOne(BookmarkModel, "object");
    // return this.belongsToOne(BookmarkModel, "topic", "label");
  }
}