import CinnamonLoader from "@/Components/CinnamonLoader/CinnamonLoader"
import { Flex } from "@mantine/core"


function MainPage() {
  return (
    <Flex
        justify={"center"}
        align={"center"}
        h={"100vh"}
        w={"100vw"}

    >
        <CinnamonLoader/>
    </Flex>
  )
}

export default MainPage