import { Card, Grid, Loading, Spacer, Text } from "@geist-ui/core";
import { Chrome, User } from "@geist-ui/icons";
import { Role } from "../ChatUI";

const Message = (props: { role: Role; message: string; working: boolean }) => {
  const { role, message, working } = props;
  return (
    <Grid.Container justify={role === "assistant" ? "flex-start" : "flex-end"}>
      <Grid xs={20}>
        <Card
          shadow
          type={role === "assistant" ? "dark" : "success"}
          width="100%"
        >
          <Grid.Container>
            <Grid xs={1} style={{ alignItems: "center" }}>
              <div>
                {role === "user" ? <User /> : <Chrome />}
                {working && <Loading type="warning"></Loading>}
              </div>
            </Grid>
            <Grid xs={22}>
              <Text>{message}</Text>
            </Grid>
          </Grid.Container>
        </Card>
      </Grid>
      <Grid xs={24}>
        <Spacer h={1}></Spacer>
      </Grid>
    </Grid.Container>
  );
};

export default Message;
