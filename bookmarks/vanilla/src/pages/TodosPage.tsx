// import { CombinedDataProvider, useSession } from "@inrupt/solid-ui-react";
// import { Box, Flex } from "@mantine/core";
// import { useEffect } from "react";

// import AppPageWrapper from "@/components/Layout/AppPageWrapper";
// import { useGetTodos } from "../atoms/todo.atom";
// import AddTodo from "../components/Todo/AddTodo";
// import TodoList from "../components/Todo/TodoList";
// import { getOrCreateTodoList } from "../utils/getOrCreateTodoList";
// import { getPodUrlAll } from "../utils/getPodUrlAll";

// function TodosPage() {
//   const { session } = useSession();
//   const { isLoggedIn, webId } = session.info;

//   const { setTodos } = useGetTodos();

//   useEffect(() => {
//     if (!session || !isLoggedIn || !webId) return;
//     (async () => {
//       const podsUrls = await getPodUrlAll(session);
//       const pod = podsUrls[0];
//       const containerUri = `${pod}todos/`;
//       const list = await getOrCreateTodoList(containerUri, session.fetch);
//       setTodos(list as any);
//     })();
//   }, [session, session.info.isLoggedIn]);

//   return (
//     <Flex
//       w="100%"
//       h="100%"
//       justify="center"
//       pt={55}
//       bg="gray.1"
//       sx={{ borderRadius: 8 }}
//     >
//       <Box>
//         {isLoggedIn && webId ? (
//           <CombinedDataProvider datasetUrl={webId} thingUrl={webId}>
//             <Flex
//               direction="column"
//               align="center"
//               justify="center"
//               w="100%"
//               gap={8}
//               bg="gray.2"
//               sx={{ borderRadius: 8, padding: 8 }}
//             >
//               <AddTodo />
//               <TodoList />
//             </Flex>
//           </CombinedDataProvider>
//         ) : null}
//       </Box>
//     </Flex>
//   );
// }

// export default TodosPage;
