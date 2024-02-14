import { Outlet } from "react-router-dom"
import Chats from "../Chats/Chats"
import "./ChatsContainer.scss";
import { ChatsProvider } from "../../Context/ChatsContext"
import useWindowSize from "../../utils/hooks/useWindowSize"
import MobileLayout from "./MobileLayout"

// export const chatsLoader = (queryClient: QueryClient): LoaderFunction => async () => {
//   try {
//     const { data } = await queryClient.ensureQueryData(chatsQuery);
//     if(data.status !== 'success') throw new Error(data.message);
//     console.log(data);
    
//     return data.chats;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (error: any) {
//     console.log(error);
//     toast.error(error?.response?.data?.message || error.message)
//   }
//   return null;
// }

const ChatsContainer = () => {

  const { width } = useWindowSize();

  return (
    <ChatsProvider>
      {width <= 768 && <MobileLayout />}
      {width > 768 && (
        <section className="chats-container">
          <div className="chats-container-left relative">
            <Chats />
          </div>
          <div className="chats-container-right">
            <Outlet />
          </div>
        </section>
      )}
    </ChatsProvider>
  );
}

export default ChatsContainer